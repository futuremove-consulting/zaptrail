## Runbook de operação do piloto WhatsApp (`OPS-007`)

Torna a manutenção repetível sem depender de investigação no código. Todos os comandos foram **validados contra o código real** do gateway (`services/whatsapp-server/server.js`) e do cron (`/api/cron/whatsapp-engine`).

### Conteúdo
- **§0 Mapa do sistema** — do WhatsApp ao CRM, com a regra do filtro de sufixos.
- **§1 Verificação em < 2 min** — as 4 perguntas do gate de operação (conectado? recebendo? processando? erro/duplicação?).
- **§2 Parear/reparear** — QR via `curl`, passo a passo no celular, parear `business` primeiro.
- **§3 Reiniciar sem deslogar** — `restart-session` preserva credenciais.
- **§4 Recuperar após logout** — `logout-session` apaga credenciais; histórico no Supabase é preservado.

### Fidelidade aos endpoints (verificado)
| Comando do runbook | Existe em `server.js` |
| --- | --- |
| `GET /health` | linha 242 |
| `GET /api/:session/status` | linha 251 |
| `GET /api/:session/qr-code` | linha 264 |
| `GET /qr/:session` | linha 281 |
| `POST /api/:session/restart-session` | linha 366 |
| `POST /api/:session/logout-session` | linha 377 |
| cron `?limit=` + `CRON_SECRET` | `whatsapp-engine/route.ts` |

### Nota de segurança (registrada, não bloqueante)
O runbook marca explicitamente que as rotas do gateway **ainda não têm autenticação** (QR público) — risco aceito nesta fase do piloto, alinhado ao backlog que adiou `SEC-*`. O pareamento deve ser feito em rede confiável.

Só documentação. Sem alteração de código, banco ou deploy.
