# ZapTrack — roadmap revisado mobile-first, Lego e custo inicial zero

## 1. Nova decisão de produto técnico

O MVP será construído como um **aplicativo mobile-first em Expo/React Native**, com React Native Web como superfície de acesso por browser. O Supabase será o núcleo gerenciado de autenticação, banco, storage e funções. A UAZAPI será um provider inicial opcional, atrás de um adapter substituível. O mock local é o primeiro provider obrigatório.

```text
Expo/RN
  → Supabase Auth
  → Supabase Edge Functions
  → Supabase Postgres/Storage
  → WhatsAppProvider
       ├── MockProvider
       ├── UAZAPIProvider
       ├── EvolutionProvider
       ├── WAHAProvider
       └── OfficialProvider futuro
  → SemanticProvider
       ├── fixture/local
       ├── LLM provider configurável
       └── provider futuro
```

## 2. Regra de custo zero

Existem três estados diferentes e não devem ser confundidos:

| Estado | Custo provável | O que é possível |
|---|---:|---|
| Protótipo local | US$ 0 | App Expo, mock, fixtures, Supabase Free, sem WhatsApp real |
| Teste real controlado | Pode deixar de ser zero | UAZAPI/trial ou provider alternativo, poucos dados e uma conexão |
| Produção | Não prometer zero | Provider, LLM, storage, domínio, execução e suporte podem cobrar |

O time deve provar o valor com mock antes de pagar ou depender de um conector. A UAZAPI pode ser usada no primeiro teste real, mas a página comercial consultada apresenta plano de até dois dispositivos por R$ 38/mês e planos de servidor pagos; portanto, ela não é custo zero recorrente [1].

## 3. O que muda no roadmap anterior

| Decisão anterior | Decisão revisada |
|---|---|
| React web/Next como caminho principal | Expo/React Native + React Native Web |
| Meta oficial como primeira conexão | Mock primeiro; UAZAPI no teste real; Meta depois |
| Backend tRPC/Drizzle como padrão | Supabase Auth/Postgres/Storage/Edge Functions como padrão Lego |
| Sincronização ampla logo no início | Uma conversa selecionada e processamento sob demanda |
| Integração real antes do produto | Produto funcional com MockProvider antes do conector |
| Custo de infraestrutura não explicitado | Custo separado em protótipo, teste real e produção |

## 4. Roadmap em 10 sprints

### Sprint 0 — decisão, contas e setup local

**Objetivo:** criar a base sem pagar e sem acoplar provider.

**Entregas:** repositório, Expo, Supabase Free, instruções Opencode e MockProvider.

**Tasks:**

1. Criar projeto Expo com TypeScript, Expo Router, NativeWind e React Native Web.
2. Criar projeto Supabase Free.
3. Configurar variáveis públicas e server-side corretamente.
4. Criar `AGENTS.md` com arquitetura, regras e Definition of Done.
5. Criar `README.md` com setup de Expo Go, web e Supabase.
6. Criar scripts de check, test e build.
7. Criar provider interfaces e `MockProvider`.
8. Criar fixtures sintéticas de conversa 1:1 e grupo.
9. Confirmar execução em telefone via Expo Go e browser.

**Gate:** app abre em telefone e web; nenhum token real está no repositório.

### Sprint 1 — Supabase Auth e workspace

**Objetivo:** estabelecer identidade e isolamento.

**Entregas:** login, logout, sessão, workspace, membership e RLS.

**Tasks:**

1. Configurar Supabase Auth.
2. Criar fluxo de login mobile e web.
3. Armazenar sessão nativa em SecureStore e sessão web conforme adapter.
4. Criar tabelas profiles, workspaces e workspace_members.
5. Criar políticas RLS.
6. Criar tela pós-login.
7. Criar workspace inicial.
8. Criar testes de leitura/escrita autorizada e negativa.

**Gate:** dois workspaces de teste não conseguem acessar dados cruzados.

### Sprint 2 — shell mobile-first

**Objetivo:** criar a aplicação que o usuário irá usar.

**Entregas:** tabs, stack de detalhes, design tokens e estados.

**Tasks:**

1. Configurar tabs `Agora`, `Conversas`, `Grupos`, `Timeline` e `Mais`.
2. Criar `ScreenContainer` em todas as telas.
3. Criar theme tokens para light/dark.
4. Criar componentes Button, Card, Badge, FilterBar, EmptyState, ErrorState e Skeleton.
5. Criar navegação para conversation detail.
6. Criar lista com FlatList.
7. Implementar safe areas, teclado e acessibilidade básica.
8. Testar Android, iOS via Expo Go e web preview.

**Gate:** todas as tabs têm conteúdo real ou empty state explícito; nenhum `onPress` vazio.

### Sprint 3 — domínio canônico e MockProvider

**Objetivo:** construir o produto sem depender de WhatsApp real.

**Entregas:** schema mínimo, ingestão fake, lista de conversas e seleção.

**Tasks:**

1. Criar tabelas conversations, conversation_participants, parties, messages e attachments.
2. Criar tabelas processing_runs, semantic_events, evidence_spans e management_objects.
3. Criar tipos compartilhados e schemas Zod.
4. Implementar MockProvider com conversas 1:1 e grupo.
5. Criar seed/factory de fixtures.
6. Implementar `conversation.list`, `conversation.get` e `conversation.select`.
7. Criar abas 1:1 e grupos.
8. Implementar seleção e confirmação de escopo.

**Gate:** usuário seleciona uma conversa sintética no telefone e vê a confirmação do escopo.

### Sprint 4 — timeline original e timeline estruturada com fixtures

**Objetivo:** provar o principal valor antes de IA e conector.

**Entregas:** conversa original, timeline estruturada e `Mostrar na conversa`.

**Tasks:**

1. Criar tela dual Conversa/Timeline/Ambas.
2. Renderizar mensagens em ordem cronológica.
3. Criar timeline items a partir de fixture semântica.
4. Criar filtros por objeto, intenção, ação, arquivo, status e período.
5. Criar detalhe de evidência.
6. Implementar `Mostrar na conversa` com highlight e contexto.
7. Testar navegação em telefone pequeno.
8. Medir tempo para primeira timeline.

**Gate:** o happy path completo funciona com uma fixture 1:1 e uma fixture de grupo.

### Sprint 5 — adapter UAZAPI e primeira conexão real

**Objetivo:** trocar o mock por uma fonte real sem alterar o domínio.

**Entregas:** `UAZAPIProvider`, conexão, sessão e status.

**Tasks:**

1. Criar credenciais/test account do provider.
2. Implementar create/status/disconnect.
3. Implementar list chats e history atrás do adapter.
4. Implementar participantes e attachments mínimos.
5. Criar tabela provider_connections.
6. Criar tela de conexão com estados.
7. Manter tokens exclusivamente em Edge Functions/secrets.
8. Testar uma instância autorizada.
9. Registrar limitações observadas de histórico/grupos.

**Gate:** uma conversa real autorizada pode ser listada sem alterar o app além da configuração do provider.

### Sprint 6 — webhook, ingestão e processamento sob demanda

**Objetivo:** persistir eventos reais e organizar somente o que o usuário escolheu.

**Entregas:** webhook, idempotência, raw data e job de organização.

**Tasks:**

1. Criar Edge Function `whatsapp-webhook`.
2. Validar segredo/HMAC quando disponível.
3. Persistir provider event antes do processamento.
4. Implementar idempotency key.
5. Normalizar chats, participantes, mensagens e attachments.
6. Criar processing run por conversa/período.
7. Limitar mensagens e período para preservar custo.
8. Criar status de job e retry.
9. Atualizar timeline quando pronto.

**Gate:** repetir evento não duplica dados; falha de LLM não impede raw data.

### Sprint 7 — pipeline semântico e objetos

**Objetivo:** transformar mensagens em objetos de gestão confiáveis.

**Entregas:** extração estruturada, evidência, confiança e objetos.

**Tasks:**

1. Criar SemanticProvider adapter.
2. Criar JSON Schema estrito para extração.
3. Criar janela contextual de mensagens.
4. Extrair entidades, menções, intenções, ações, decisões e datas.
5. Criar evidence spans.
6. Validar com Zod e rejeitar output inválido.
7. Criar objetos task, commitment, decision, file e attention.
8. Marcar low confidence e review required.
9. Materializar timeline.
10. Criar reprocessamento seletivo.

**Gate:** cada item estruturado possui mensagem de origem, confiança e estado.

### Sprint 8 — onboarding real e primeiro valor

**Objetivo:** unir conexão, seleção, organização e timeline em uma jornada contínua.

**Entregas:** onboarding completo e ativação.

**Tasks:**

1. Criar stepper de onboarding.
2. Exibir escopo de dados antes da conexão.
3. Mostrar sync/processamento em andamento.
4. Criar picker 1:1/grupo.
5. Criar preview de decisões, tarefas, compromissos e arquivos.
6. Criar CTA Ver timeline.
7. Criar Mostrar na conversa.
8. Criar fallback por fixture/importação/encaminhamento.
9. Instrumentar funil.
10. Corrigir o maior ponto de abandono.

**Gate:** usuário novo consegue ativar sem suporte síncrono obrigatório.

### Sprint 9 — hardening, limites e publicação web/mobile de teste

**Objetivo:** tornar o MVP confiável sem adicionar escopo.

**Tasks:**

1. Testar RLS e isolamento.
2. Testar tokens, upload e prompt injection.
3. Testar payloads duplicados e fora de ordem.
4. Testar falha de provider e LLM.
5. Testar large list e timeline longa.
6. Criar limites de mensagens, mídia e processamento.
7. Configurar logs e correlation ID.
8. Publicar versão web mobile/PWA para early users.
9. Gerar build de teste Expo somente se necessário.
10. Documentar known issues.

**Gate:** beta fechado funciona com dados autorizados e limites explícitos.

### Sprint 10 — beta fechado e release MVP

**Objetivo:** publicar a versão mínima com controle.

**Tasks:**

1. Selecionar 3–10 usuários beta.
2. Executar smoke test real.
3. Monitorar connection rate, selection rate, timeline ready e evidence open.
4. Revisar falsos positivos/negativos.
5. Corrigir bloqueadores.
6. Configurar produção e secrets.
7. Executar migrações.
8. Publicar web mobile/PWA.
9. Preparar distribuição mobile posterior.
10. Criar rollback e suporte.

**Gate final:** login → conectar → escolher → organizar → timeline → evidência funciona.

## 5. Critério para escolher UAZAPI ou alternativa

| Critério | Peso de decisão |
|---|---:|
| Webhook confiável e autenticável | Muito alto |
| Lista de chats e grupos | Muito alto |
| Histórico recuperável | Muito alto |
| Status de sessão/reconexão | Alto |
| Documentação/testabilidade | Alto |
| Custo inicial | Alto |
| Dependência comercial | Médio |
| Facilidade de trocar | Muito alto |

Não selecionar por preço isolado. Selecionar após um spike de 1–2 dias que prove:

```text
conectar
receber evento
listar 1:1
listar grupo
buscar histórico
baixar metadata de mídia
configurar webhook
repetir evento sem duplicar
```

## 6. Spike obrigatório de provider

Antes do Sprint 5, criar uma branch `spike/provider-uazapi` e responder objetivamente:

```text
1. consigo criar/conectar uma instância?
2. consigo identificar a conta conectada?
3. consigo listar chats?
4. consigo separar 1:1 de grupo?
5. consigo obter histórico suficiente?
6. consigo receber webhook?
7. consigo autenticar webhook?
8. consigo recuperar falha/reconectar?
9. consigo apagar/desconectar a instância?
10. o custo e os limites são aceitáveis?
```

Se falhar em histórico, grupos ou webhook, não adaptar o domínio para contornar o provider. Trocar o adapter/provider e preservar o core.

## 7. Estratégia LLM sem custo inicial

```text
Fase 1: fixture sem IA
Fase 2: LLM local ou quota gratuita disponível
Fase 3: modelo econômico via adapter
Fase 4: roteamento por complexidade e custo
```

A extração de MVP pode começar com poucas classes e processamento sob demanda. Não gerar embeddings, resumos e múltiplas passagens para todas as mensagens antes de validar que são necessários.

## 8. Estratégia de deploy

### Fase gratuita

```text
Expo Go para teste nativo
React Native Web/PWA para acesso por link
Supabase Free
Edge Functions dentro da franquia
MockProvider
```

### Quando surgir requisito de disponibilidade

O webhook precisa de endpoint público. Edge Functions do Supabase podem servir como ponto de entrada do webhook dentro dos limites gratuitos. Se o provider exigir um processo persistente próprio, considerar hospedagem separada apenas nessa etapa. Não pagar servidor antes de provar a necessidade.

## 9. Referências

[1]: https://uazapi.dev/ — UAZAPI, página comercial e preços públicos consultados em 26/08/2026.

[2]: https://docs.uazapi.com/ — UAZAPI/uazapiGO V2, documentação de endpoints consultada em 26/08/2026.

[3]: https://supabase.com/pricing — Supabase, plano Free e limites consultados em 26/08/2026.

[4]: https://waha.devlike.pro/docs/how-to/events/ — WAHA, webhooks, retries, HMAC e eventos.

[5]: https://wppconnect.io/docs/projects/wppserver/introduction/ — WPPConnect Server, API, grupos e webhooks.

[6]: https://github.com/evolution-foundation/evolution-api — Evolution API, projeto open source e integrações.
