# ZapTrack — arquitetura Lego mobile-first

## 1. Decisão central

O ZapTrack será composto por blocos substituíveis, conectados por contratos internos estáveis:

```text
Expo/React Native + React Native Web
          │
          ▼
Supabase Auth + Postgres + Storage + Edge Functions
          │
          ├── WhatsAppProvider adapter
          │       ├── MockProvider
          │       ├── UAZAPIProvider
          │       ├── EvolutionProvider
          │       └── Waha/WPPConnectProvider
          │
          ├── LLMProvider adapter
          │       ├── Local/OpenAI-compatible
          │       ├── Gemini/OpenAI/Anthropic-compatible
          │       └── built-in provider, se disponível
          │
          └── ZapTrack proprietary core
                  ├── canonical data model
                  ├── semantic pipeline
                  ├── evidence/provenance
                  ├── management objects
                  └── timeline projection
```

Nenhum cliente mobile deve chamar diretamente a UAZAPI ou o LLM. Todas as credenciais e decisões de integração ficam no backend.

## 2. Por que Expo/React Native

O requisito é mobile first e o produto terá listas densas, timeline, busca, anexos, notificações e, posteriormente, agente conversacional. Expo/React Native oferece uma base nativa para Android/iOS e pode entregar web com React Native Web. A aplicação deve ser desenhada para telefone primeiro e expandida para tablet/desktop, não o contrário.

Next.js/PWA continua sendo uma alternativa válida para validar rapidamente por link, mas não é a escolha principal se o objetivo é uma experiência móvel persistente. Não iniciar duas bases de frontend.

## 3. Blocos gerenciados

| Bloco | Responsabilidade | Código proprietário do ZapTrack |
|---|---|---|
| Expo/React Native | Renderização mobile, navegação, gestos e cache local | Design system e telas |
| Supabase Auth | Identidade e sessão | Onboarding e autorização de produto |
| Supabase Postgres | Fonte de verdade | Schema, RLS, queries e projeções |
| Supabase Storage | Bytes de anexos | Metadados, evidência e políticas |
| Supabase Edge Functions | Webhooks, callbacks e jobs curtos | Orquestração e regras |
| UAZAPI/Evolution/WAHA/WPPConnect | Sessão, chats, mensagens, grupos e eventos WhatsApp | Adapter e normalização |
| LLM | Extração semântica e respostas opcionais | Prompt, schema, quality gate, revisão |
| Expo Go | Teste no telefone sem loja | Build/release posterior |

## 4. Contrato do provider WhatsApp

Criar uma interface própria, por exemplo:

```ts
interface WhatsAppProvider {
  createConnection(input: CreateConnectionInput): Promise<ProviderConnection>;
  getConnectionStatus(input: ConnectionRef): Promise<ConnectionStatus>;
  configureWebhook(input: WebhookConfig): Promise<void>;
  listChats(input: ListChatsInput): Promise<Page<ProviderChat>>;
  getChatHistory(input: ChatHistoryInput): Promise<Page<ProviderMessage>>;
  getChatParticipants(input: ChatRef): Promise<ProviderParticipant[]>;
  downloadMedia(input: MediaRef): Promise<ProviderMedia>;
  disconnect(input: ConnectionRef): Promise<void>;
}
```

O adapter deve converter qualquer provider para tipos canônicos:

```text
ProviderConnection
ProviderChat
ProviderParticipant
ProviderMessage
ProviderAttachment
ProviderEvent
```

A regra é simples: trocar o provider não pode exigir alterar telas, entidades, timeline, prompts ou queries do domínio.

## 5. Provider inicial

A UAZAPI é adequada para o primeiro teste real pela velocidade de integração e pela documentação pública de instâncias, chats, contatos, grupos, webhooks e eventos. A página comercial pública observada mostra plano de até dois dispositivos por R$ 38/mês e planos de servidor de R$ 138/mês e R$ 195/mês; portanto, ela não deve ser considerada custo zero recorrente.

A Evolution API é a alternativa quando o desenvolvedor aceitar operar uma solução open source e um servidor persistente. WAHA possui webhooks, HMAC, retries e eventos de grupo bem documentados, mas também exige operação própria e apresenta modalidade de suporte/comunidade paga. WPPConnect é uma opção Node.js pronta, com sessões, contatos, mensagens, grupos e webhook, mas igualmente exige operação persistente.

Decisão pragmática:

```text
Desenvolvimento sem provider: MockProvider
Primeiro teste real: UAZAPIProvider
Plano de redução de dependência: EvolutionProvider ou WAHAProvider
Contrato do domínio: sempre WhatsAppProvider
```

## 6. Fluxo de eventos

### Recebimento

```text
UAZAPI/Evolution/WAHA
  → POST /functions/v1/whatsapp-webhook
  → validar segredo/HMAC quando disponível
  → persistir inbound_event
  → responder 2xx rapidamente
  → normalizar ProviderEvent
  → upsert conversation/message/participant
  → criar processing_job opcional
```

### Organização sob demanda

Para o primeiro MVP, não processar toda a conta permanentemente. O usuário escolhe uma conversa 1:1 ou grupo e toca em `Organizar`.

```text
usuário escolhe conversa
  → create processing_run
  → buscar histórico autorizado
  → persistir/confirmar raw messages
  → dividir em janelas contextuais
  → extract semantic JSON
  → validate
  → resolve entities
  → create evidence
  → propose management objects
  → materialize timeline
  → app atualiza status
```

Esse desenho reduz custo de LLM, storage e processamento e permite provar o produto antes de construir um worker 24/7.

## 7. LLM adapter

```ts
interface SemanticProvider {
  extract(input: SemanticExtractionInput): Promise<SemanticExtractionResult>;
  embed?(input: EmbeddingInput): Promise<EmbeddingResult>;
}
```

A extração deve usar saída estruturada, schema estrito e validação Zod. O resultado mínimo contém:

```text
entities
mentions
intents
actions
events
facts
assertions
time_expressions
management_object_proposals
evidence_spans
confidence
```

O produto não deve fixar o nome de um modelo nas telas. Usar `LLM_PROVIDER` e `LLM_MODEL` no backend. Para custo mínimo, começar com um modelo local OpenAI-compatible ou créditos/free tier disponíveis, mantendo um provider adapter. Não assumir que qualquer free tier será permanente.

## 8. Fonte de verdade no Supabase

Tabelas mínimas:

```text
profiles
workspaces
workspace_members
provider_connections
provider_events
conversations
conversation_participants
parties
party_aliases
messages
attachments
processing_runs
processing_steps
entity_mentions
semantic_events
semantic_assertions
evidence_spans
management_objects
object_evidence
object_state_transitions
conversation_timeline_items
audit_events
```

Regras:

```text
cada linha privada possui workspace_id ou deriva de uma relação autorizada
messages são raw e não são alteradas pela IA
semantic_events são interpretações versionáveis
semantic_assertions possuem status e validade
management_objects sempre apontam para evidência
conversation_timeline_items são projeção reconstruível
```

## 9. Segurança Supabase

Usar Row Level Security desde a primeira tabela de negócio. O app mobile usa a chave pública anon/publishable e sessão; service role key fica apenas nas Edge Functions. Toda função precisa validar usuário, workspace e conexão antes de acessar dados.

Não colocar token UAZAPI, admin token, chave de LLM ou service role no bundle Expo. Não registrar texto completo de mensagens, tokens ou mídia em logs.

## 10. Custo zero honesto

### Protótipo sem gasto

```text
Expo Go/local
Supabase Free
MockProvider
fixtures sintéticas
LLM local, trial ou quota gratuita disponível
sem mídia pesada
processamento somente sob demanda
```

### Primeiro teste real

O Supabase Free é adequado para pequeno piloto, com limites públicos de 2 projetos ativos, 500 MB de banco, 1 GB de storage, 5 GB de egress, 500 mil invocações de Edge Functions e pausa de projetos após uma semana de inatividade [1]. UAZAPI, conforme preço público observado, começa em plano pago; portanto, o primeiro teste real pode deixar de ser custo zero.

### Controle de consumo

```text
limitar período/mensagens por organização
não baixar attachment por padrão
processar somente conversa selecionada
limitar tamanho de arquivo
guardar checksum e metadata
não gerar embeddings antes de provar necessidade
pausar ingestão quando quota estiver próxima
```

## 11. Duas opções viáveis

| Abordagem | Trade-offs | Custo | Complexidade de setup |
|---|---|---|---|
| Expo/RN + Supabase + MockProvider, depois UAZAPI | Melhor para mobile first e baixo risco inicial; exige criar adapter e lidar com build Expo | US$ 0 no protótipo; UAZAPI pode ser pago no teste real | Baixa/média |
| Expo/RN + Supabase + Evolution API ou WAHA self-hosted | Menos dependência comercial e mais controle; exige servidor persistente, Docker/Node, segurança e manutenção | Software open source; hospedagem e operação não são necessariamente gratuitas | Média/alta |
| Next.js/PWA + Supabase + UAZAPI | Mais rápido para validar por URL e mais simples no desktop; pior adequação para experiência nativa e distribuição mobile | US$ 0 no protótipo; provider/LLM podem cobrar | Baixa |

Escolha recomendada: **Expo/React Native + Supabase + MockProvider no começo; UAZAPI como primeiro conector real atrás do adapter**. Só operar Evolution/WAHA se o custo do provider comercial ou a necessidade de controle justificar o aumento de operação.

## 12. Estrutura de repositório

```text
zaptrack/
  app/                         # Expo Router
    (auth)/
    (tabs)/
      agora.tsx
      conversas.tsx
      grupos.tsx
      timeline.tsx
    conversation/[id].tsx
    onboarding/
  components/
  hooks/
  lib/
    supabase.ts
    api.ts
    providers/
      whatsapp.ts
      llm.ts
  supabase/
    migrations/
    functions/
      whatsapp-webhook/
      connection-status/
      organize-conversation/
      process-step/
  packages/
    domain/
    schemas/
  tests/
  AGENTS.md
  README.md
```

## 13. O que é proprietário

O diferencial não está em conectar WhatsApp, armazenar texto ou chamar LLM. Está em:

```text
modelo universal de interação
resolução contextual de entidades
afirmações com evidência e validade
geração de objetos de gestão
timeline dual
Mostrar na conversa
quality gate e revisão
projeções Agora/Calendário/Kanban
```

## 14. O que não construir agora

```text
microserviços
Neo4j
vector database separado
workflow builder
agente autônomo com escrita externa
integração oficial Meta no primeiro teste
grafo visual
processamento contínuo de todas as conversas
app nativo publicado em loja antes da validação
```

## 15. Ordem prática

```text
1. Expo app + Supabase Auth + schema mínimo
2. MockProvider + fixture 1:1/grupo
3. picker + organize + timeline
4. LLM adapter e objetos com evidência
5. UAZAPIProvider e webhook real
6. teste real controlado
7. limites, observabilidade e publicação web/Expo
```

## Referências

[1]: https://supabase.com/pricing — Supabase, Pricing & Fees.

[2]: https://docs.uazapi.com/ — UAZAPI/uazapiGO V2, documentação de API.

[3]: https://uazapi.dev/ — UAZAPI, página comercial e preços públicos.

[4]: https://github.com/evolution-foundation/evolution-api — Evolution API, repositório oficial.

[5]: https://waha.devlike.pro/docs/how-to/events/ — WAHA, Events/Webhooks.

[6]: https://wppconnect.io/docs/projects/wppserver/introduction/ — WPPConnect Server, documentação oficial.
