# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0.0 — ZapTrail MVP Package-First

**Shipped:** 2026-10-21  
**Phases:** 4 | **Plans:** 9 | **Tasks:** 18  

### What Was Built
- Núcleo semântico universal `@futuremove/zaptrail-core` agnóstico com cálculo determinístico de `EvidenceRef` e separação epistêmica.
- Pacote de domínio imobiliário `@futuremove/zaptrail-domain-real-estate` resolvendo 100% dos 20 Casos-Ouro (`CT-01` a `CT-20`).
- `PilotCRMAdapter` estritamente aderente à constraint `enrichment_action_ck`, extinguindo o erro P0 `create_deal`.
- Estágio 2 híbrido com LLM Structured Outputs, `quote-validator` anti-alucinação e coalescência de turnos com outbound seeding.
- Persistência PostgreSQL/RLS corrigida no Supabase (001-004), audit trail imutável e Inbox de Revisão com Timeline Dual ("Mostrar na conversa").
- Superfície standalone via rota REST `/api/v1/ingest/whatsapp` e servidor MCP `@futuremove/zaptrail-mcp` stdio JSON-RPC 2.0.

### What Worked
- **Arquitetura Package-First**: Separar o core das regras imobiliárias e das integrações externas evitou acoplamento precoce e garantiu reusabilidade imediata.
- **TDD Rigoroso**: 100% dos requisitos cobertos por testes unitários e de integração antes ou durante a implementação (214 testes passando).
- **Quality Gate de 350 Linhas**: A regra de teto `<= 350` linhas por arquivo manteve o design coeso, legível e desacoplado em todas as camadas.
- **Ciclos de Code Review Convergente**: Os 4 ciclos de revisão no final de cada fase identificaram e blindaram casos de borda antes do arquivamento.

### What Was Inefficient
- Subagente customizado `gsd-integration-checker` falhou ao inicializar devido a dependência de componente ausente no harness (`tool "glob"`). A auditoria cruzada foi realizada e documentada pelo agente principal com evidência em testes.
- Sintaxe bash/PowerShell (`&&` vs `;`, `wc -l` vs `Measure-Object`) exigiu adaptações pontuais para o ambiente Windows do host.

### Patterns Established
- Determinação exata de `char_start`/`char_end` em código TypeScript via `indexOf(exact_quote)` sobre `normalized_text` em vez de confiar em contadores gerados por LLMs.
- Zero vazamento de termos de domínio validado por teste de boundary arquitetural automatizado (`QA-01`).
- Preservação estrita de `original_payload` em revisões humanas, registrando anotações de auditoria em campos separados.

### Key Lessons
1. A combinação de um Estágio 1 determinístico rápido com um Estágio 2 acionado estritamente em turnos ambíguos fornece o equilíbrio ideal entre custo, latência e robustez semântica.
2. Contratos de constraint no banco de dados (ex.: `enrichment_action_ck`) devem ter esquemas Zod equivalentes no adapter para prevenir violações antes da escrita.

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Tests | Key Change |
|---|---|---|---|---|
| v1.0.0 | 4 | 9 | 214 | Bootstrap do motor Package-First, 20 Casos-Ouro, Supabase RLS e MCP |

### Cumulative Quality

| Milestone | Tests | Files <= 350 lines | Domain Leakage in Core |
|---|---|---|---|
| v1.0.0 | 214 | 100% | 0 tokens |

### Top Lessons (Verified Across Milestones)

1. Nunca confiar em citações de LLM sem validação determinística de substring contra o texto original.
2. Manter arquivos abaixo de 350 linhas força uma modularidade natural e previne a degradação da base de código.
