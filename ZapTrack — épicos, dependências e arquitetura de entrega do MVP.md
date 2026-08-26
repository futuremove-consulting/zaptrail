# ZapTrack — épicos, dependências e arquitetura de entrega do MVP

## 1. Linha de produto do MVP

```text
Autenticação
  → Workspace
  → Conexão WhatsApp
  → Ingestão/sincronização
  → Conversas 1:1/Grupos
  → Mensagens e evidências
  → Extração semântica
  → Objetos de gestão
  → Timeline estruturada
  → Mostrar na conversa
  → Publicação
```

## 2. Épicos

| ID | Épico | Resultado |
|---|---|---|
| E00 | Fundação e setup | Repositório executável, ambientes, padrões e CI básico |
| E01 | Identidade e workspace | Usuário autenticado e dados isolados por workspace |
| E02 | Design system e shell | Aplicação navegável, responsiva e preparada para estados |
| E03 | Conexão WhatsApp | Fonte oficial conectada e status verificável |
| E04 | Ingestão e sincronização | Webhooks/sync persistem mensagens, conversas e participantes |
| E05 | Modelo semântico | Eventos, entidades, intenções, ações e evidências estruturados |
| E06 | Objetos de gestão | Tarefas, compromissos, decisões, arquivos e alertas derivados |
| E07 | Conversas e grupos | Lista, busca, seleção 1:1/grupo e contexto inicial |
| E08 | Timeline dual | Conversa original, timeline estruturada, filtros e evidências |
| E09 | Agente/fallback de entrada | Encaminhamento/importação como caminho alternativo mínimo |
| E10 | Segurança e operação | Segredos, ACL, logs, retries, idempotência e monitoramento |
| E11 | QA, beta e publicação | Testes, hardening, documentação e release do MVP |

## 3. Caminho crítico

```text
E00 → E01 → E03 → E04 → E05 → E06 → E08 → E11
                    ↘ E07 ↗
E02 ─────────────────────────────↗
E10 acompanha todos os épicos
```

E07 pode iniciar enquanto E04 prepara dados, mas a lista real de conversas depende da fonte conectada e de mensagens persistidas. E08 não deve ser finalizada antes de E05/E06, pois a timeline precisa de itens semânticos e evidências.

## 4. Dependências de produto

```text
workspace_id
  → source_connection
  → conversation
  → message
  → interaction_event
  → evidence
  → management_object
  → timeline_item
```

Nenhuma feature pode criar entidades sem `workspace_id`, autorização e referência de origem quando o dado for derivado de conversa.

## 5. Trilha A — plataforma

Inclui setup, ambiente, schema, migrações, autenticação, workspace, logs, jobs, storage, configuração e deploy.

## 6. Trilha B — fonte WhatsApp

Inclui Embedded Signup, validação de retorno, tokens server-side, assinatura de webhook, deduplicação, sync e estados da fonte.

## 7. Trilha C — conhecimento

Inclui normalização, participantes, menções, entidades, eventos, intents/actions, tempo, evidência, confiança e objetos de gestão.

## 8. Trilha D — experiência

Inclui shell, onboarding, picker 1:1/grupo, processamento, preview, timeline dual, filtros, `Mostrar na conversa`, loading/empty/error e responsividade.

## 9. Trilha E — qualidade e lançamento

Inclui testes unitários, integração, contrato, segurança, observabilidade, dados de demonstração autorizados, beta, rollback e documentação.

## 10. Regra de arquitetura

Monólito modular, não microserviços. Uma aplicação web com módulos internos e jobs assíncronos, contratos tRPC e schema tipado. O MVP não precisa de Neo4j, vector database separado, workflow builder ou motor de agentes externo.

## 11. Ordem de construção

1. Fazer a aplicação subir e publicar uma página protegida.
2. Fazer login e workspace funcionarem.
3. Fazer a fonte WhatsApp conectar e retornar status verificável.
4. Fazer uma mensagem recebida persistir de forma idempotente.
5. Fazer uma conversa aparecer no picker.
6. Fazer o pipeline gerar um evento/objeto com evidência.
7. Fazer a timeline mostrar conteúdo estruturado.
8. Fazer `Mostrar na conversa` localizar a mensagem correta.
9. Fazer falhas e reprocessamentos funcionarem.
10. Publicar beta controlado.

## 12. Escopo de objetos do primeiro release

```text
task
commitment
decision
file
attention
```

Entidades de contexto mínimas:

```text
person
organization
conversation
conversation_participant
project opcional
```

Ações, pedidos, compras, aprovações, cancelamentos e outros domínios podem ser identificados como eventos e intenções, mas não precisam de telas ou workflows específicos no MVP.
