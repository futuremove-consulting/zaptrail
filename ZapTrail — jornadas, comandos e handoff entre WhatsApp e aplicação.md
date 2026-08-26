# ZapTrail — jornadas, comandos e handoff entre WhatsApp e aplicação

## 1. Jornada móvel: antes de uma reunião ou atendimento

```text
usuário: “O que preciso saber antes de falar com a Maria?”
agente: identifica Maria, empresa, projeto e últimos eventos
agente: responde em até poucos blocos
agente: mostra pendências, decisões e riscos relevantes
agente: oferece [Abrir contexto completo]
```

A aplicação abre a pessoa/empresa correta, com período recente, últimas conversas e filtros preservados.

## 2. Jornada móvel: recuperar pendências

```text
usuário: “O que ficou pendente com o cliente XP?”
agente: recupera objetos abertos e atrasados
agente: separa compromisso, tarefa, decisão e atenção
agente: mostra evidência curta
usuário: “Adie a ligação para sexta”
agente: apresenta resumo da alteração e pede confirmação
usuário: “Confirmar”
agente: atualiza o objeto interno e registra auditoria
```

Ações mutáveis devem usar confirmação explícita. O agente não deve interpretar um “ok” ambíguo como autorização para uma ação externa irreversível.

## 3. Jornada móvel: registrar algo novo

```text
usuário: “Anote que preciso enviar a proposta para João amanhã.”
agente: interpreta ação, pessoa e prazo
agente: responde: “Posso criar uma tarefa para enviar a proposta a João amanhã?”
usuário: “Sim”
agente: cria management object
agente: informa ID/status e origem como mensagem do agente
```

Se a pessoa ou o prazo forem ambíguos, o agente pergunta somente o mínimo necessário.

## 4. Jornada concentrada: investigar na aplicação

```text
usuário abre link do agente
  → autenticação/handshake
  → pessoa/empresa/projeto já selecionado
  → timeline com filtro preservado
  → conversa original disponível
  → objeto lateral com evidência
```

A aplicação não deve abrir a home genérica quando o usuário veio de uma pergunta contextual. O deep link deve carregar `workspace`, `entity`, `conversation`, `project`, `object`, `filter` e `period` autorizados.

## 5. Jornada concentrada: revisar a primeira conversa

```text
usuário abre aplicação
  → escolhe Conversas ou Grupos
  → seleciona conversa
  → escolhe período
  → toca Organizar
  → vê progresso
  → recebe preview
  → abre Timeline
  → filtra decisões/tarefas/arquivos
  → toca Mostrar na conversa
```

## 6. Vocabulário de comandos

O agente deve compreender linguagem natural, mas internamente mapear as solicitações para intenções e ferramentas limitadas.

| Família | Exemplos | Ferramenta interna |
|---|---|---|
| Contexto | “O que sei sobre João?” | `get_entity_context` |
| Histórico | “Qual foi o último contato?” | `get_recent_activity` |
| Pendências | “O que ficou pendente?” | `list_open_objects` |
| Decisões | “O que foi decidido?” | `list_decisions` |
| Agenda | “O que tenho hoje?” | `list_due_objects` |
| Projeto | “Como está o projeto X?” | `get_project_context` |
| Conversa | “Mostre onde isso foi dito” | `get_evidence` + deep link |
| Criar | “Anote/crie/registe...” | `propose_object` |
| Alterar | “Adie/conclua/corrija...” | `propose_object_update` |
| Navegação | “Abra a timeline” | `create_deep_link` |

## 7. Ferramentas do agente

### Read-only

```text
search_messages
search_timeline
get_conversation
get_group
get_entity_context
get_project_context
list_management_objects
get_management_object
get_evidence
get_metrics_summary
create_deep_link
```

### Mutação interna com confirmação

```text
propose_management_object
confirm_management_object
update_management_object
mark_object_done
snooze_object
link_object_to_project
confirm_entity_link
correct_assertion
```

### Fora do MVP

```text
send_external_message
cancel_external_order
make_payment
approve_contract
book_external_appointment
change_external_system
```

## 8. Formato de resposta do agente

```text
[resposta direta]

Contexto: [pessoa/empresa/projeto/período]

Itens relevantes:
• [objeto/status/prazo]
• [objeto/status/prazo]

Evidência: [mensagem/data/remetente]

Ações:
[Ver detalhes] [Abrir timeline] [Mostrar na conversa]
```

Em uma tela pequena, limitar a resposta a três itens prioritários e oferecer “Ver mais”. A aplicação é o destino para listas longas e auditoria.

## 9. Handoff WhatsApp → aplicação

O agente gera link profundo assinado ou tokenizado, nunca uma URL que exponha IDs sensíveis sem autorização.

```text
https://app.zaptrail.com/context/{short-lived-token}
```

O token deve conter ou referenciar:

```text
user/workspace
entity/object/conversation IDs
filter state
expiration
one-time nonce
```

A aplicação valida o token server-side, confirma a sessão e abre somente o contexto autorizado.

## 10. Handoff aplicação → WhatsApp

A aplicação pode oferecer:

```text
Perguntar ao agente
Enviar resumo para mim
Continuar no WhatsApp
Copiar pergunta
```

No MVP, preferir “copiar pergunta” ou “abrir conversa com o agente” antes de enviar automaticamente dados sensíveis.

## 11. Identidade

O agente identifica o usuário pelo número do WhatsApp associado ao `AgentConnection`. A associação deve ter sido feita na aplicação por login e verificação. Um telefone não verificado não deve acessar o workspace somente porque conhece o número do agente.

```text
AgentConnection phone
  → verified_user_phone
  → user_id
  → workspace memberships
  → authorization policy
```

Se um usuário pertence a mais de um workspace, o agente deve perguntar qual contexto usar ou aplicar o workspace padrão explicitamente configurado.

## 12. Respostas com incerteza

O agente precisa distinguir:

```text
confirmado: sustentado por evidência clara
sugerido: inferência com confiança razoável
ambíguo: existem interpretações alternativas
não encontrado: não há evidência recuperada
indisponível: fonte/processamento não está pronto
```

Nunca responder “Maria é responsável” quando a fonte apenas contém “Maria pode avaliar”. A resposta deve dizer “há uma indicação de que...” e mostrar a evidência.

## 13. Continuidade entre superfícies

A aplicação e o agente compartilham:

```text
identidade
workspace
filtros salvos
objetos
estados
evidências
correções
projetos
histórico de auditoria
```

A conversa com o agente não é a fonte original da atividade empresarial; ela é uma nova conversa de consulta/comando que também pode gerar objetos internos.

## 14. Critérios de sucesso

| Jornada | Critério |
|---|---|
| Pergunta rápida | Usuário recebe resposta contextual em até uma interação normal |
| Pendência | Resultado mostra objeto, estado, prazo e evidência |
| Criação | Objeto só é criado após confirmação |
| Handoff | Aplicação abre no contexto correto |
| Investigação | Mostrar na conversa destaca a mensagem original |
| Correção | Alteração aparece no agente e na aplicação |
| Permissão | Workspace incorreto nunca aparece |
