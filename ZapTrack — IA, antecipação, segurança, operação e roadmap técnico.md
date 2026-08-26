# ZapTrack — IA, antecipação, segurança, operação e roadmap técnico

## 1. Arquitetura de IA

A IA deve ser uma camada de interpretação e recomendação, não a fonte soberana de verdade. A fonte de verdade é o dado persistido e a ação confirmada. O sistema deve usar uma política interna de modelos, sem expor complexidade ao usuário.

| Função | Método principal | Controle obrigatório |
|---|---|---|
| Normalização | Código e dicionário versionado | Preservar original |
| Detecção de idioma | Classificador leve | Registrar idioma e confiança |
| Extração de entidades | LLM estruturado + regex/parsers | Schema, unidade, timezone e evidência |
| Intent multilabel | Classificador/LLM | Classes versionadas e abstention |
| Resumo | LLM com contexto delimitado | Citar evidências e marcar ausência |
| Embedding | Modelo gerenciado | Versionar modelo e dimensão |
| Busca | FTS + vetor + filtros | Tenant, permissão, recência |
| Ranking de atenção | Regras determinísticas primeiro | Explicação e feedback |
| Predição | Só após rótulos históricos | Calibração, intervalo e revisão |
| Ação externa | API tipada | Policy gate, aprovação, idempotência e log |

## 2. Contrato da saída da IA

Toda análise deve retornar um contrato semelhante a:

```json
{
  "object_type": "task",
  "status": "proposed",
  "title": "Enviar proposta",
  "entities": [],
  "due_at": null,
  "owner_candidate": null,
  "priority": "medium",
  "confidence": 0.0,
  "evidence": [
    {"message_id": "...", "quote": "...", "span": [0, 0]}
  ],
  "uncertainties": [],
  "recommended_action": "ask_confirmation",
  "model_version": "...",
  "policy_version": "..."
}
```

A aplicação deve validar o schema, verificar coerência temporal e semântica, impedir valores impossíveis, exigir evidência e encaminhar baixa confiança para revisão. O LLM não grava diretamente no banco nem executa uma ferramenta sem passar pelo domínio.

## 3. Anticipatory design pragmático

A tela inicial não deve ser um painel de tudo. Deve ser um painel de atenção. O sistema deve organizar a próxima ação provável com base em evidência e defaults, sem transformar inferências em fatos.

### Score inicial de atenção

Começar com regras explicáveis:

- impacto do assunto para receita/operação;
- urgência explícita ou proximidade do prazo;
- idade da pendência ou ausência de resposta;
- gravidade da reclamação/problema;
- recência e mudança desde a última visita;
- desconto por duplicidade, silêncio normal ou item já resolvido.

O score é uma ordenação de atenção, não uma verdade objetiva. Cada item precisa explicar a composição em linguagem simples: “priorizado porque há prazo amanhã e não existe resposta registrada”.

### Padrões de interface

- `O que mudou desde sua última visita`.
- `O que está vencendo`.
- `O que precisa de confirmação`.
- `O que foi criado automaticamente`.
- `O que está bloqueado`.
- `O que foi concluído`.

O produto deve antecipar, mas não interromper o usuário a todo momento. Alertas devem ser agrupados e suprimidos quando forem repetitivos. O usuário deve conseguir desfazer, silenciar, ajustar e dizer que o alerta não é relevante.

## 4. Política de ação

A camada de ação deve funcionar como um policy gate centralizado:

```text
proposta da IA
   ↓
validar schema e evidência
   ↓
classificar risco da ação
   ↓
verificar permissão e consentimento
   ↓
informar | sugerir | pedir confirmação | executar reversível | bloquear
   ↓
registrar resultado e auditoria
```

| Ação | Nível recomendado |
|---|---|
| Mostrar evidência e resumo | Automática |
| Sugerir objeto | Automática, aguardando usuário |
| Criar rascunho de tarefa | Automática, editável |
| Criar tarefa interna | Automática apenas com política aprovada |
| Delegar tarefa | Confirmação no início |
| Atualizar CRM/ERP | Confirmação ou política aprovada por workspace |
| Enviar mensagem ao cliente | Confirmação no MVP |
| Cobrar, cancelar, conceder desconto ou alterar contrato | Bloqueado no MVP |
| Agente autônomo de atendimento | Fase posterior e produto separado |

## 5. Segurança e privacidade por desenho

O produto deve assumir que conversas podem conter dados pessoais, comerciais e potencialmente sensíveis. O desenho mínimo inclui tenant isolation, RLS, RBAC, escopo de captura, retenção configurável, exclusão, exportação, criptografia, gestão de secrets, mascaramento em logs e prompts, controle de mídia, auditoria de acesso e resposta a incidentes.

O consentimento/opt-in, o uso da conversa para análise, a comunicação proativa e eventual uso para melhoria de modelos devem ser explicados em política e contrato. O sistema deve respeitar opt-out e não reabrir comunicação automaticamente após uma solicitação de interrupção.

Dados para desenvolvimento e avaliação devem ser anonimizados ou sintetizados. O corpus de avaliação deve registrar se contém dado real, consentimento, finalidade e owner. A empresa não deve usar conversas de clientes para treinamento geral sem uma política clara e revisão especializada.

## 6. Observabilidade

A operação precisa tornar visíveis tanto falhas técnicas quanto falhas de entendimento.

| Sinal | Métrica mínima |
|---|---|
| Ingestão | eventos recebidos, rejeitados, duplicados e atrasados |
| Webhook | latência, status, retries e falhas por fonte |
| Processamento | duração, tentativas, erro por etapa, backlog |
| IA | custo, tokens, latência, schema failure, abstention |
| Qualidade | aceite, edição, rejeição, falso positivo reportado |
| Ação | sucesso, falha, duplicidade, reversão e autorização |
| Produto | primeiro objeto, primeira ação, retorno 7/30 dias |
| Segurança | acesso negado, exportação, exclusão e incidentes |

Logs devem carregar `tenant_id`, `correlation_id`, `message_id`, `analysis_id`, `object_id`, `action_id` e versões, mas não devem registrar conteúdo bruto sem necessidade.

## 7. Metas internas iniciais

As metas abaixo são objetivos operacionais provisórios para piloto, não claims comerciais:

- aceitar e persistir webhook válido rapidamente, sem análise no request;
- processar mensagem textual simples em poucos minutos;
- mostrar evidência para 100% dos objetos propostos;
- permitir editar/rejeitar 100% dos objetos antes de efeitos externos;
- ter deduplicação determinística para eventos repetidos;
- acompanhar falhas e reprocessar por conversa e versão;
- medir custo por conversa e impedir que prompts cresçam sem limite;
- manter o feed funcional mesmo quando um job de IA falhar;
- obter dados reais de aceite/edição/rejeição antes de calibrar modelos preditivos.

## 8. Controle de custo e complexidade

A primeira versão deve processar incrementalmente apenas mensagens novas ou janelas impactadas. O sistema deve resumir em camadas, reutilizar contexto persistido, cachear embeddings, limitar tokens, evitar reprocessar uma conversa inteira e aplicar modelos mais caros somente a casos ambíguos.

A complexidade deve aparecer onde aumenta confiança: evidência, versões, permissões, idempotência e reversão. Não deve aparecer em centenas de configurações expostas, microsserviços ou múltiplos dashboards.

## 9. Roadmap técnico

| Fase | Entrega técnica | Saída de negócio |
|---|---|---|
| 0–30 dias | Schemas, workspace, ingestão/importação, cinco objetos, dataset de avaliação e feed simples | Validar se a dor existe e se o primeiro objeto é útil |
| 31–60 dias | Pipeline assíncrono, busca híbrida, evidência, confirmação, edição, auditoria e jobs reexecutáveis | Usuário consegue transformar conversa em gestão |
| 61–90 dias | Piloto, feedback, ranking de atenção, lembretes internos, métricas de qualidade e custo | Medir hábito, qualidade e valor percebido |
| 3–6 meses | Conector oficial mais robusto, permissões avançadas, retenção/exclusão, relatórios e integração de destino | Produto inicial pago |
| 6–12 meses | Verticalização, preditivo limitado, automações de baixo risco e primeiro agente supervisionado | Expansão controlada |
| 12+ meses | Agentes com policy engine maduro, múltiplos verticais, knowledge graph sob demanda | Plataforma/ecossistema |

## 10. Critérios para separar serviços

Continuar como monólito modular enquanto o problema for organizacional. Separar worker de mídia/IA quando a carga, memória ou tempo de execução afetarem o app. Separar gateway de conectores quando integrações exigirem ciclo de segurança, escala ou deploy independente. Não separar por “módulo de marketing” ou por nome de marca.

## 11. Princípio final

A arquitetura deve fazer o sistema parecer simples porque a complexidade está resolvida internamente. O usuário vê uma conversa, um contexto, uma sugestão e um próximo passo. O sistema, por trás, controla versões, evidências, policies, retries, permissões e auditoria.
