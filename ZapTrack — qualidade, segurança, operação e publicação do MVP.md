# ZapTrack — qualidade, segurança, operação e publicação do MVP

## 1. Test pyramid

### Unitários

Cobrir normalizadores, idempotência, resolução de datas, mapeamento de status, autorização, parser e validação JSON.

### Integração

Cobrir banco, procedures, webhook, sync job, storage, pipeline semântico e materialização da timeline.

### Contrato

Cobrir payloads da fonte, callback de conexão, normalização canônica e schema semântico.

### Browser/E2E

Cobrir login, conexão simulada, seleção 1:1, seleção grupo, organização, preview, timeline e Mostrar na conversa.

### Manual

Testar compreensão de escopo, confiança da IA, acessibilidade, mobile, textos de erro e retomada.

## 2. Dados de teste

Usar somente fixtures sintéticas ou anonimizadas:

```text
conversa 1:1 simples
grupo com múltiplos participantes
mensagens duplicadas
reply/citação
arquivo
áudio não processável
data relativa
multi-intenção
pronome ambíguo
contradição
mensagem sem ação
```

Nunca versionar conversa pessoal ou empresarial real.

## 3. Segurança

```text
tokens somente no servidor
segredos fora do Git
ACL por workspace/source/conversation
payloads sanitizados
upload com MIME/tamanho/checksum
proteção contra XSS e prompt injection
logs sem conteúdo sensível por padrão
links de arquivo autorizados e expiráveis
revogação de fonte
trilha de auditoria
```

O conteúdo de mensagens deve ser tratado como dado, não como instrução para o agente. Prompts precisam separar claramente instruções de sistema, dados da conversa e comandos do usuário.

## 4. Integridade semântica

Todo resultado derivado deve conter:

```text
source_message_ids
evidence_span ou referência
model_version
prompt_version
confidence
review_state
created_at
```

Resultados sem evidência, JSON inválido ou confiança insuficiente não viram objeto confirmado.

## 5. Confiabilidade

```text
webhook responde rápido
payload persiste antes do processamento
jobs idempotentes
retry com backoff
dead letter lógico
reprocessamento seletivo
estado parcial visível
processamento assíncrono
```

A falha do LLM não pode interromper ingestão. A falha do arquivo não pode apagar a mensagem. A falha da fonte não pode destruir o que já foi processado.

## 6. Observabilidade

### Logs

```text
correlation_id
workspace_id
source_connection_id
conversation_id
message_id
job_id
stage
status
latency
error_code
```

Não registrar texto completo, token, telefone desnecessário ou conteúdo de arquivo nos logs de produção.

### Métricas

```text
webhook_success_rate
webhook_latency
message_dedup_rate
sync_success_rate
sync_duration
processing_success_rate
llm_invalid_output_rate
low_confidence_rate
timeline_ready_time
show_in_conversation_success_rate
activation_rate
```

## 7. Gates de lançamento

### Gate técnico

```text
typecheck passa
testes passam
build passa
migrações aplicadas
health endpoint responde
webhook verificado
segredos configurados
rollback documentado
```

### Gate de produto

```text
login → conexão → seleção → organização → timeline → evidência
```

O caminho deve ser executável com uma fixture e com uma fonte real autorizada quando disponível.

### Gate de segurança

```text
sem vazamento cross-workspace
sem token no client
sem upload não autorizado
sem ação externa implícita
sem conteúdo sensível em logs
```

### Gate operacional

```text
alerta para webhook falho
alerta para job travado
consulta de processamento
reprocessamento manual
status de fonte
procedimento de revogação
```

## 8. Plano de release

```text
local
  → staging com mock
  → staging com fonte autorizada
  → beta fechado
  → release candidate
  → produção gradual
```

A fonte real da Meta é uma dependência externa. Manter mock e fallback para que aprovação, configuração ou elegibilidade não paralisem o desenvolvimento.

## 9. Smoke test de produção

1. Entrar com usuário autorizado.
2. Confirmar workspace.
3. Abrir conexão.
4. Validar status da fonte.
5. Receber uma mensagem de teste autorizada.
6. Confirmar conversa no picker.
7. Executar processamento.
8. Abrir timeline.
9. Abrir evidência.
10. Usar Mostrar na conversa.
11. Verificar logs e métricas.
12. Testar retry de uma falha controlada.

## 10. Plano de rollback

```text
desabilitar novo processamento sem derrubar leitura
pausar ingestão nova se necessário
reverter frontend
preservar raw data
reprocessar com versão anterior
reativar webhook
comunicar usuários afetados
```

Não apagar dados brutos como estratégia de rollback.

## 11. Opções de execução

| Abordagem | Trade-offs | Custo | Complexidade de setup |
|---|---|---|---|
| Stack gerenciada com Next.js/Supabase e jobs gerenciados | Mais controle sobre código e portabilidade; exige configurar contas, credenciais, webhook e operação | Variável conforme uso de banco, storage, jobs e IA | Média |
| Ambiente web gerenciado com backend, auth, storage e deploy integrados | Menor operação inicial e publicação mais rápida; maior acoplamento ao ambiente | Baixo para iniciar; cresce com uso | Baixa |
| Backend persistente independente com Docker/VM | Máximo controle e liberdade; exige segurança, deploy, monitoramento e manutenção própria | Maior custo operacional | Alta |

Para o MVP desenvolvido com Opencode, a recomendação é escolher **uma** stack canônica e não misturar as três. A decisão proposta permanece: código modular em Next.js/TypeScript, Supabase/Postgres/Storage/pgvector, jobs gerenciados e integração oficial da Meta; usar o ambiente web gerenciado somente se a prioridade máxima for prototipagem e publicação rápida, aceitando o acoplamento.
