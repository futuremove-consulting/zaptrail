## CI custo-zero — o que muda

Pipeline enxugado para caber na cota gratuita do plano Free em repo privado (2.000 min/mes).

### Mudancas no `ci.yml`
- `paths-ignore`: docs, `*.md` e `extrator-proprietarios` nao disparam runs.
- `concurrency.cancel-in-progress`: cancela runs obsoletos do mesmo branch.
- `workflow_dispatch` adicionado: permite rodar manualmente quando precisar.
- `sprint-0-baseline` (Playwright/Chromium): so via manual.
- `build` (next build): so via manual — a Vercel ja compila no preview/producao.
- `extrator-ci`: so via manual (projeto irmao ausente = skip imediato, mas consumia fila).
- Servico Redis removido do job `test` (unit tests usam MOCK_MODE).

### Mudancas no `security-audit.yml`
- Cron semanal desabilitado (comentado, reversivel); roda sob demanda ou local (`pnpm audit --prod`).

### O que continua rodando em push/PR
- `lint-and-typecheck`, `test` (vitest + postgres), `guard-main`, `commit-style`, `deploy-staging/preview` (condicional), `notify-failure`.

### Validacao
- YAML validado via `pnpm dlx js-yaml` (ambos OK).
- Rotina local equivalente sem gastar minutos: `pnpm lint && pnpm test && pnpm --filter pilotcrm type-check && pnpm build`.

### Nota sobre billing
Se os runs continuarem falhando com "payments failed / spending limit", o bloqueio e no nivel da conta (Settings > Billing > Payment information / Spending limit), nao no workflow. Verificar la antes de re-rodar.
