# ZapTrack — escopo e Definition of Done do MVP

## 1. Objetivo do MVP

Publicar um produto web utilizável que permita ao usuário:

```text
1. autenticar-se;
2. criar ou acessar seu workspace;
3. conectar uma fonte oficial do WhatsApp Business ou usar fallback de importação/encaminhamento;
4. selecionar uma conversa 1:1 ou grupo disponível e autorizado;
5. organizar mensagens e evidências;
6. identificar uma primeira camada de intenções, ações, decisões, arquivos e objetos de gestão;
7. visualizar uma timeline cronológica estruturada;
8. alternar para a conversa original;
9. usar Mostrar na conversa para verificar a evidência.
```

## 2. Primeiro valor

O usuário está ativado quando seleciona uma conversa real, visualiza a timeline estruturada e abre uma evidência na conversa original.

## 3. Escopo obrigatório

```text
auth OAuth
workspace e perfil
conexão WhatsApp Business oficial
retorno e validação server-side
webhook de ingestão
sync/status de processamento
conversas 1:1 e grupos elegíveis
mensagens e participantes
anexos como metadados/referências
normalização e deduplicação
entidades e menções básicas
intent/action/event extraction
objetos mínimos: tarefa, compromisso, decisão, arquivo e alerta
proveniência/evidência
confidence e review_state
timeline original/estruturada
filtros básicos
Mostrar na conversa
logs, métricas e auditoria mínima
fallback de importação/encaminhamento
```

## 4. Fora do MVP

```text
Neo4j ou banco de grafos separado
grafo visual
GraphRAG sofisticado com travessia indireta
calendário completo dia/semana/mês/ano
Kanban completo e customizável
envio automático de mensagens
ações externas de cobrança/pagamento/cancelamento
multi-tenant enterprise avançado
billing e planos pagos
mobile nativo
integrações profundas com CRM/ERP
OCR/áudio de todos os formatos
classificação perfeita de todos os domínios
```

Esses itens podem aparecer como placeholders ou roadmap, mas não devem bloquear a publicação do primeiro produto.

## 5. Premissas técnicas

```text
frontend: React + TypeScript + Vite + Tailwind/shadcn
backend: Express + tRPC
persistência: Drizzle + MySQL/TiDB do ambiente; abstração preparada para Postgres/Supabase se necessário
storage: storage gerenciado para arquivos
LLM: helper server-side com saída JSON Schema estrita
jobs: eventos/webhooks + processamento assíncrono
hosting: ambiente web gerenciado com processo persistente somente se necessário
```

O roadmap para Opencode deve manter o núcleo em um repositório simples e modular, evitando microserviços, múltiplos bancos e frameworks de agentes no primeiro ciclo.

## 6. Critérios de pronto do MVP

O MVP só deve ser publicado quando:

```text
login funciona em ambiente publicado
fonte conectada aparece com estado real
webhook é validado e idempotente
mensagem duplicada não cria duplicata
conversa 1:1 e grupo podem ser selecionados
processamento assíncrono é retomável
cada objeto possui evidência
timeline é ordenável e filtrável
Mostrar na conversa leva à mensagem correta
permissão impede vazamento entre workspaces
falhas possuem mensagem e recuperação
logs permitem investigar uma execução
testes críticos passam
segredos não aparecem no frontend ou Git
```

## 7. Definição de pronto de cada item

Uma história só está pronta quando possui:

```text
implementação
critério de aceite atendido
teste unitário ou de integração adequado
estado loading/empty/error
controle de autorização
observabilidade mínima
documentação de configuração
revisão visual no browser
```
