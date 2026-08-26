# ZapTrack — Especificação Universal de Conversas em Gestão

## Organizador, estruturador e agente operacional para toda a atividade conversacional da empresa

**Data:** 26 de agosto de 2026  
**Escopo:** ações, intenções, eventos, objetos, relações, agente no WhatsApp, aplicação externa, arquitetura, dados, IA, governança e roadmap.

> **Decisão central:** o ZapTrack deve ser uma **camada universal de estruturação da atividade conversacional**. Ele identifica o que acontece nas conversas entre a empresa e seus clientes, colaboradores, parceiros, fornecedores e demais interlocutores; transforma o significado em eventos e objetos de gestão; e permite consultar, corrigir e operar esse conhecimento pelo WhatsApp ou pela aplicação externa.

---

## 1. A definição definitiva do produto

O ZapTrack não deve ser limitado a vendas, atendimento ou follow-up. A sua unidade de valor é qualquer acontecimento conversacional que tenha relevância para relacionamento, operação, decisão, compromisso, transação, risco ou execução.

Isso inclui solicitações, agendamentos, cancelamentos, reagendamentos, compras, contratações, aprovações, reclamações, elogios, avaliações, reuniões, ligações, vendas, cobranças, pagamentos, entregas, pedidos, envios e muitas outras ações.

A formulação correta é:

> **ZapTrack é o organizador e estruturador inteligente de conversas de negócio que transforma linguagem, contexto e mídia em uma estrutura viva de eventos, objetos de gestão, relações, decisões, indicadores e próximos passos.**

O agente no WhatsApp é a interface de acesso imediato. A aplicação externa é o centro de profundidade, revisão e governança. Ambos usam o mesmo núcleo.

### Posicionamento recomendado

> **Organize suas conversas. Transforme tudo o que foi dito em gestão. Consulte e opere pelo WhatsApp.**

Versão comercial:

> **O ZapTrack identifica o que foi pedido, combinado, aprovado, vendido, comprado, pago, entregue, cancelado, reclamado ou decidido — e transforma isso em gestão rastreável.**

Versão institucional:

> **Do diálogo à decisão, da intenção à execução: o ZapTrack estrutura a atividade da empresa a partir das suas conversas.**

---

## 2. Universalidade não significa caos

O erro seria transformar cada verbo em uma tela, cada departamento em um agente e cada situação em um produto. A universalidade deve existir no **modelo semântico**, não como uma explosão de menus.

O ZapTrack deve organizar qualquer caso por composição de dimensões estáveis:

```text
ator
+ contraparte
+ relação
+ ato linguístico
+ ação de negócio
+ objeto
+ estado
+ tempo
+ valor
+ evidência
+ compromisso
+ risco
+ próximo passo
```

Assim, “o fornecedor confirmou a entrega para sexta-feira” e “o cliente confirmou a reunião para sexta-feira” são casos diferentes na superfície, mas compartilham a mesma estrutura: participantes, relação, ação, objeto, estado, tempo, evidência e próximo passo.

### Três níveis de capacidade

Esta distinção protege o produto contra promessas exageradas:

| Nível | O que o ZapTrack faz |
|---|---|
| **Cobertura semântica** | Reconhece que uma mensagem contém uma solicitação, compra, reclamação, pagamento, reunião, entrega ou outra ação. |
| **Estruturação gerencial** | Converte o caso em evento, entidade ou objeto com estado, responsável, prazo, valor e evidência. |
| **Automação operacional** | Executa uma ação, como criar tarefa, enviar lembrete, atualizar sistema ou enviar mensagem, respeitando autorização e risco. |

O MVP pode ter **cobertura semântica ampla**, **estruturação para muitos tipos** e **automação operacional limitada aos casos seguros**. Isso atende à visão universal sem tentar construir dezenas de workflows completos no primeiro dia.

---

## 3. Unidade universal: InteractionEvent

A unidade central é o **evento de interação**:

> **Quem fez o quê, em relação a quem, sobre qual objeto, com qual intenção, em que estado, quando, com que valor, sustentado por qual evidência e exigindo qual próximo passo.**

### Dimensões

| Dimensão | Pergunta | Exemplos |
|---|---|---|
| Ator | Quem fala ou age? | Cliente, usuário, colaborador, parceiro, fornecedor |
| Contraparte | Com quem a ação se relaciona? | Empresa, equipe, cliente, fornecedor |
| Relação | Qual é o contexto relacional? | Comercial, atendimento, interna, parceria, suprimentos |
| Ato linguístico | O que a mensagem faz? | Perguntar, solicitar, informar, oferecer, aprovar |
| Ação de negócio | O que acontece no negócio? | Agendar, comprar, pagar, contratar, entregar |
| Objeto | Sobre o que é a ação? | Reunião, pedido, contrato, fatura, produto |
| Estado | Em que estágio está? | Proposto, solicitado, confirmado, executado |
| Tempo | Quando ocorre ou deve ocorrer? | Hoje, amanhã, 15/09, recorrente |
| Valor | Qual quantidade ou valor existe? | R$ 500, 3 unidades, 2 horas |
| Canal/local | Onde ocorre? | WhatsApp, loja, reunião online, endereço |
| Feedback | Qual avaliação ou reação existe? | Reclamação, elogio, nota, satisfação |
| Compromisso | O que alguém assumiu? | Promessa, prazo, pagamento, retorno |
| Risco | O que pode dar errado? | Atraso, cancelamento, inadimplência |
| Evidência | Qual mensagem/mídia sustenta? | Texto, áudio, imagem, PDF, link |
| Próximo passo | O que deve acontecer? | Responder, confirmar, delegar, executar |
| Confiança | Quão segura é a interpretação? | Alta, média, baixa, abstain |

---

## 4. Taxonomia universal

### 4.1 Atos linguísticos

O sistema deve distinguir o que a mensagem faz na conversa do que acontece no negócio.

| Família | Classes |
|---|---|
| Solicitação | Perguntar, pedir, solicitar, requisitar, encomendar |
| Informação | Informar, comunicar, atualizar, avisar, notificar |
| Proposição | Oferecer, cotar, sugerir, convidar, propor |
| Decisão | Aprovar, autorizar, aceitar, recusar, rejeitar, vetar |
| Compromisso | Prometer, assumir, confirmar prazo, garantir, reservar |
| Coordenação | Agendar, convocar, marcar, reagendar, delegar, encaminhar |
| Mudança | Alterar, corrigir, prorrogar, renovar, substituir |
| Encerramento | Cancelar, concluir, fechar, arquivar, rescindir |
| Feedback | Reclamar, elogiar, avaliar, pontuar, recomendar |
| Escalonamento | Cobrar, pressionar, contestar, reportar, escalar |
| Negociação | Negociar, contrapropor, pedir desconto, condicionar |
| Relacional | Agradecer, apresentar, introduzir, acompanhar |

### 4.2 Ações de negócio

| Família | Ações |
|---|---|
| Atendimento | Solicitar suporte, responder dúvida, abrir chamado, resolver, escalar |
| Agenda | Reunir, ligar, visitar, agendar, confirmar, reagendar, cancelar, lembrar |
| Comercial | Prospectar, qualificar, cotar, propor, negociar, vender, renovar, recuperar |
| Compra | Consultar, cotar, comprar, encomendar, contratar, receber, devolver |
| Contrato | Aprovar, assinar, ativar, renovar, alterar escopo, rescindir |
| Financeiro | Faturar, cobrar, pagar, receber, parcelar, estornar, reembolsar, conciliar |
| Pedido/entrega | Criar, alterar, separar, enviar, transportar, entregar, atrasar, devolver |
| Operação | Abrir tarefa, atribuir, executar, bloquear, corrigir, revisar, concluir |
| Pessoas | Alocar, orientar, avaliar, aprovar folga, delegar, escalar conflito |
| Marketing | Divulgar, convidar, recomendar, avaliar campanha, cancelar inscrição |
| Parceria | Indicar, apresentar, co-vender, co-criar, negociar, encaminhar |
| Feedback | Reclamar, elogiar, avaliar, pontuar, recomendar, contestar |
| Risco | Detectar atraso, falha, indisponibilidade, disputa, fraude suspeita, urgência |
| Conhecimento | Explicar, resumir, decidir, documentar, pesquisar, perguntar |

A taxonomia deve ser versionada e aceitar sinônimos, abreviações, regionalismos, áudio, code-switching e novas categorias. `other` e `unknown` são valores válidos, não falhas de design.

### 4.3 Relações

| Relação | Interações predominantes |
|---|---|
| Cliente/prospect | Compra, venda, suporte, reclamação, avaliação, renovação, pagamento |
| Colaborador | Tarefa, delegação, reunião, aprovação, decisão, avaliação |
| Parceiro | Indicação, oportunidade, contrato, co-venda, projeto, comissão |
| Fornecedor | Cotação, compra, contrato, entrega, cobrança, qualidade |
| Prestador | Serviço, agenda, contrato, pagamento, execução |
| Sócio/gestor | Decisão, aprovação, risco, prioridade, métrica |
| Grupo/comunidade | Discussão, aviso, consenso, conflito, decisão |

Um participante pode ter papéis diferentes por workspace ou por conversa.

---

## 5. Objetos de gestão

Nem todo evento precisa virar objeto. Todo trecho relevante pode ser estruturado como evento, mas somente o que precisa ser acompanhado, lembrado, decidido ou executado deve virar objeto de gestão.

| Objeto | Casos cobertos |
|---|---|
| Solicitação | Pedido de informação, serviço, compra, suporte ou aprovação |
| Compromisso | Promessa, prazo, garantia, retorno, pagamento ou entrega |
| Agendamento | Reunião, ligação, visita, consulta, evento, reserva |
| Venda/oportunidade | Lead, proposta, negociação, venda, renovação, perda |
| Pedido/compra | Pedido, cotação aprovada, compra, recebimento, devolução |
| Contrato/serviço | Contratação, assinatura, ativação, alteração, renovação |
| Cobrança/pagamento | Fatura, cobrança, promessa, pagamento, estorno, disputa |
| Entrega/envio | Coleta, despacho, trânsito, atraso, entrega, devolução |
| Tarefa | Ação interna, follow-up, revisão, correção, delegação |
| Reclamação/chamado | Queixa, incidente, suporte, resolução, reabertura |
| Feedback/avaliação | Elogio, crítica, nota, NPS, recomendação, melhoria |
| Decisão | Discussão, proposta, aprovação, comunicação, execução |
| Documento/arquivo | Recebimento, envio, revisão, aprovação, assinatura |
| Projeto/iniciativa | Escopo, reunião, marco, bloqueio, conclusão |
| Risco/exceção | Atraso, falha, urgência, conflito, inadimplência |

### Estado universal

```text
mentioned → proposed → requested → acknowledged → approved
→ scheduled → confirmed → committed → in_progress → completed
→ cancelled / rejected / failed / disputed / expired
```

O estado é contextual. “Podemos marcar amanhã?” é uma proposta; “reunião confirmada amanhã às 10h” é confirmação. “Vou pagar sexta” é compromisso; “pagamento recebido” é conclusão apoiada por evidência.

---

## 6. Arquitetura dual

![Arquitetura universal de dupla interface do ZapTrack](https://private-us-east-1.manuscdn.com/sessionFile/6kyDMg1hYN0vL138nYOYJh/sandbox/dz2dKTHbfGMM9l1Dc7fkqw-images_1787768821545_na1fn_L2hvbWUvdWJ1bnR1L3phcHRyYWNrX2R1YWxfaW50ZXJmYWNlX2FyY2hpdGVjdHVyZQ.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvNmt5RE1nMWhZTjB2TDEzOG5ZT1lKaC9zYW5kYm94L2R6MmRLVEhiZkdNTTlsMURjN2ZrcXctaW1hZ2VzXzE3ODc3Njg4MjE1NDVfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwzcGhjSFJ5WVdOclgyUjFZV3hmYVc1MFpYSm1ZV05sWDJGeVkyaHBkR1ZqZEhWeVpRLnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc4OTQzMDQwMH19fV19&Key-Pair-Id=K2QY5QTL8JSY6C&Signature=MEYCIQD6B~aHg9rVUJ2YIVCIV2EbPrKzlz5nnIcXCb98irG0kQIhAOqn9U6v~bfI1IMjKzQiqxcESMhOSv~ymVLKAHjPtYFP)

### WhatsApp como cockpit

O agente no WhatsApp atende consultas, comandos, confirmações, correções, alertas e envio de conteúdo. O usuário pode perguntar:

- “Quais pendências vencem hoje?”
- “O que o cliente Alfa pediu?”
- “Quais fornecedores estão atrasados?”
- “Quem precisa aprovar alguma coisa?”
- “O que foi decidido na reunião?”
- “Quais pagamentos foram prometidos?”
- “Resuma as reclamações da última semana.”
- “Crie uma tarefa para cobrar o fornecedor.”

### Aplicação como centro de comando

A aplicação externa serve para pareamento, escolha de fontes, permissões, feed completo, busca avançada, auditoria, revisão em massa, arquivos, métricas, configuração e aprovação de ações sensíveis.

A aplicação deve ser organizada por **áreas da empresa**, mas todos os objetos vêm do mesmo núcleo:

| Área | Visões predominantes |
|---|---|
| Comercial | Leads, propostas, vendas, negociações, follow-ups |
| Atendimento | Solicitações, reclamações, satisfação, resolução |
| Financeiro | Faturas, cobranças, pagamentos, reembolsos |
| Operações | Pedidos, entregas, tarefas, incidentes |
| Pessoas | Reuniões, delegações, aprovações, avaliações |
| Suprimentos | Cotações, compras, fornecedores, recebimentos |
| Diretoria | Decisões, riscos, compromissos, indicadores |

O usuário pode permanecer no WhatsApp para o cotidiano e abrir a aplicação quando precisar de profundidade. Não são dois produtos: são duas janelas para a mesma estrutura de gestão.

---

## 7. Pipeline semântico universal

### Passagem ampla

Executada para mensagens ou janelas relevantes:

1. identificar idioma, fonte, conversa, autor e participantes;
2. deduplicar e normalizar timestamp;
3. segmentar trechos semanticamente independentes;
4. detectar atos linguísticos em multilabel;
5. detectar candidatos a ações de negócio;
6. extrair entidades, datas e valores básicos;
7. estimar confiança e decidir se precisa de análise profunda.

### Passagem profunda

Executada para candidatos relevantes:

1. resolver ator, contraparte e relação;
2. identificar objeto/assunto;
3. inferir estado e transição válida;
4. extrair compromisso, prazo, valor e responsável;
5. classificar feedback, risco e sentimento como sinais auxiliares;
6. vincular evidências;
7. projetar evento, objeto, alerta ou métrica;
8. sugerir próximo passo;
9. passar pelo policy gate.

Esse desenho permite cobertura ampla sem aplicar o processamento mais caro a toda mensagem social ou irrelevante.

### Multi-evento

Uma única mensagem pode conter vários eventos:

> “Cancele a reunião de amanhã, reagende para sexta e envie a proposta atualizada.”

Resultado:

| Evento | Ação | Objeto | Estado |
|---|---|---|---|
| 1 | Cancelar | Reunião | Solicitado |
| 2 | Reagendar | Reunião | Solicitado |
| 3 | Enviar/atualizar | Proposta | Solicitado |

Cada evento mantém evidência, dependências e estado próprios.

---

## 8. Núcleo de dados

As tabelas centrais são:

| Tabela | Função |
|---|---|
| `workspaces` | Organização, plano e políticas |
| `members` | Usuário, papel e permissões |
| `parties` | Pessoas, empresas, equipes e entidades externas |
| `party_roles` | Papel relacional por workspace/conversa |
| `connectors` | Fonte, escopo, status e credencial referenciada |
| `conversations` | Contexto da interação |
| `messages` | Evidência bruta imutável |
| `attachments` | Mídia e referência ao storage |
| `interaction_events` | Eventos semânticos observados |
| `semantic_analyses` | Interpretações versionadas |
| `entities` | Pessoas, empresas, produtos, datas, valores, pedidos e contratos |
| `management_objects` | Objetos de gestão e ciclo de vida |
| `object_relations` | Relações entre eventos, entidades, mensagens e objetos |
| `state_transitions` | Histórico de estados |
| `action_commands` | Comandos autorizados |
| `action_runs` | Execução, retry, erro e reversão |
| `metric_definitions` | Fórmula, fonte e definição de métrica |
| `metric_snapshots` | Resultado por período e escopo |
| `feedback` | Aceite, edição, rejeição e correção |
| `audit_logs` | Acesso, decisão, ferramenta e ação |
| `job_runs` | Processamento assíncrono |

A mensagem é imutável. A análise é versionada. O objeto é mutável com histórico. A ação é idempotente e auditável.

---

## 9. Agente e ferramentas de domínio

O agente não consulta o banco diretamente. Ele usa ferramentas tipadas:

| Ferramenta | Finalidade |
|---|---|
| `search_conversations` | Buscar conversas por termo, período, relação ou empresa |
| `search_messages` | Buscar mensagem ou trecho de evidência |
| `get_evidence` | Mostrar origem de uma conclusão |
| `list_management_objects` | Listar tarefas, pedidos, pagamentos, reclamações e demais objetos |
| `get_management_object` | Consultar detalhe, estado, owner e histórico |
| `list_attention_items` | Mostrar o que mudou ou exige ação |
| `get_metric` | Consultar métrica definida e atualizada |
| `search_files` | Buscar arquivos por nome, conteúdo, origem ou relação |
| `get_file_summary` | Resumir arquivo com transcrição/OCR disponível |
| `create_object_draft` | Criar rascunho revisável |
| `update_object` | Alterar estado, prazo, owner ou atributo permitido |
| `complete_object` | Concluir objeto com registro de resultado |
| `create_internal_reminder` | Criar lembrete interno |
| `update_external_system` | Atualizar CRM/ERP mediante autorização |
| `send_customer_message` | Ação externa sensível, não liberada por padrão |
| `export_data` | Exportação com permissão forte |

Não oferecer `run_sql`, `execute_code` ou ferramentas genéricas sem escopo.

---

## 10. Ações e governança

A ação deve seguir:

```text
pergunta/comando
   ↓
resolver identidade, workspace e escopo
   ↓
interpretar intenção e parâmetros
   ↓
validar evidência, schema e transição
   ↓
verificar permissão e risco
   ↓
informar | sugerir | pedir confirmação | executar | bloquear
   ↓
registrar resultado e auditoria
```

| Nível | Exemplos | Política |
|---|---|---|
| Baixo | Resumir, buscar, listar, classificar | Pode executar automaticamente |
| Médio | Criar tarefa, atribuir, lembrar | Política do workspace ou confirmação inicial |
| Alto | Atualizar CRM, alterar etapa, alterar prazo | Confirmação e auditoria |
| Crítico | Cobrar, pagar, cancelar, estornar, excluir, falar com cliente | Bloqueado no MVP ou confirmação forte |

A mesma ação pode ter políticas diferentes conforme a relação. Atualizar o status de uma tarefa interna é diferente de registrar pagamento, alterar contrato ou enviar uma cobrança.

---

## 11. Stack e arquitetura operacional

A stack independente recomendada continua sendo:

| Camada | Escolha |
|---|---|
| Web | Next.js + React + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| API | Route Handlers/Server Actions + Zod |
| Banco | Supabase Postgres |
| Auth/RLS | Supabase Auth + Row Level Security |
| Busca | Postgres Full-Text Search + pgvector |
| Storage | Supabase Storage |
| Jobs | Inngest |
| IA | AI SDK + gateway de provedores |
| Canal | WhatsApp Business Platform/Cloud API oficial |
| Observabilidade | Sentry + logs estruturados |
| Analytics | PostHog ou equivalente sem conteúdo bruto |

Supabase reúne Postgres, autenticação, RLS, Storage, Realtime, APIs e vetores/embeddings em uma plataforma integrada.[4] Inngest cobre funções disparadas por eventos, cron ou webhook com jobs, retries e steps.[5] O AI SDK suporta geração de dados estruturados com schemas e múltiplos provedores.[6]

Se o piloto for construído dentro do ambiente Manus, usar o stack nativo React/Vite + Express/tRPC + Drizzle/TiDB + storage/LLM integrados, sem misturar Next.js/Supabase no mesmo projeto. A ontologia e os contratos permanecem iguais.

### O que não usar inicialmente

Não usar microserviços precoces, Kubernetes, Kafka, data lake, vector database separado, workflow builder genérico, agente com acesso livre ao banco ou automação de navegador como base do produto.

---

## 12. WhatsApp: limites que precisam estar na promessa

A WhatsApp Business Platform possui webhooks oficiais para mensagens e outros eventos, e a operação precisa tratar retries e duplicidade.[7] O endpoint deve persistir o payload, deduplicar e processar de forma assíncrona.

O fluxo oficial de coexistência permite que um negócio compartilhe dados e histórico do WhatsApp Business App conforme consentimento e elegibilidade, mas a documentação informa que mensagens de grupos não são incluídas no histórico compartilhado.[1] [2]

A Groups API não significa acesso geral aos grupos já existentes. Ela trata de grupos criados e gerenciados pela API, com elegibilidade e limites próprios, e a documentação informa que não está disponível para números do WhatsApp Business App.[3]

Portanto, o posicionamento correto é:

> **O ZapTrack organiza as conversas às quais você autorizou acesso e tudo o que você enviar ou importar para ele.**

Para grupos comuns, o produto deve oferecer encaminhamento, importação ou integração oficialmente elegível quando comprovada. Não prometer leitura invisível de todo WhatsApp pessoal.

---

## 13. Roadmap universal sem perder foco

### Fase 0 — prova de viabilidade

Validar número do agente, conta Meta, onboarding, pareamento, elegibilidade, webhook, importação, consentimento e escopo real de fontes. O objetivo é eliminar qualquer promessa de acesso que o canal não sustente.

### Fase 1 — cobertura universal de eventos

Implementar o contrato universal e reconhecer as principais famílias de atos, ações, objetos, estados, relações, datas, valores, compromissos, feedbacks e riscos. Toda saída terá evidência, confiança e `other/unknown`.

### Fase 2 — objetos de gestão confiáveis

Projetar objetos comuns para solicitação, compromisso, agendamento, venda, pedido, contrato, pagamento, entrega, tarefa, reclamação, feedback, decisão, arquivo e risco. No início, apenas alguns objetos terão fluxos avançados de automação.

### Fase 3 — agente de consulta

Liberar no WhatsApp consultas de conversas, eventos, objetos, arquivos, métricas e pendências. Respostas mostram escopo, período, frescor e evidência.

### Fase 4 — agente de comando supervisionado

Liberar criação de rascunho, tarefa interna, lembrete, correção de objeto, atribuição e conclusão. Ações externas continuam com confirmação forte.

### Fase 5 — aplicação de profundidade

Entregar feed universal, áreas da empresa, busca, timeline, métricas, arquivos, revisão em massa, permissões, retenção, exportação e auditoria.

### Fase 6 — automações e verticais

Adicionar integrações, ações externas, automações de baixo risco, domínios específicos, agentes especializados e grupos API somente quando houver necessidade e elegibilidade.

---

## 14. Critérios de qualidade

O ZapTrack deve medir a qualidade por dimensão, e não somente uma acurácia geral:

| Dimensão | Pergunta |
|---|---|
| Detecção | Reconheceu a mensagem relevante? |
| Ato linguístico | Entendeu se era pergunta, pedido, confirmação ou reclamação? |
| Ação | Identificou comprar, pagar, agendar, cancelar ou outra ação? |
| Objeto | Resolveu reunião, pedido, contrato, entrega ou pagamento? |
| Estado | Diferenciou proposta, confirmação, execução e cancelamento? |
| Participantes | Identificou ator, contraparte e owner? |
| Tempo/valor | Interpretou prazo, data, quantidade e valor? |
| Evidência | Apontou para a mensagem correta? |
| Próximo passo | Sugeriu ação útil e segura? |
| Comportamento | Soube abster-se quando não havia confiança? |

Erros que criam cobrança, pagamento, cancelamento, contrato, venda, entrega ou comunicação externa incorreta devem ter severidade alta e thresholds conservadores.

---

## 15. Veredito final

A visão correta do ZapTrack é mais ampla do que “copiloto comercial” e mais concreta do que “organismo conversacional”. Ele deve ser:

> **Um sistema universal de estruturação da atividade conversacional da empresa.**

O núcleo identifica eventos e relações; a ontologia organiza ações e objetos; os objetos transformam conversa em gestão; o agente torna tudo consultável e operável no WhatsApp; a aplicação externa oferece profundidade e governança.

A fórmula final é:

> **Conversas entram como evidência. Eventos saem como significado. Objetos saem como gestão. Ações saem como execução. Feedback volta como aprendizado.**

O melhor caminho é construir universalidade no núcleo desde o início, mas liberar automação de forma progressiva e segura. Assim, o ZapTrack pode abranger clientes, colaboradores, parceiros, fornecedores, grupos, compras, vendas, reuniões, pagamentos, entregas, contratos, reclamações e decisões sem se tornar um catálogo de software impossível de operar.

## Referências externas

[1]: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users — Meta for Developers, “Onboard WhatsApp Business app users”.

[2]: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/history — Meta for Developers, “history webhook reference”.

[3]: https://developers.facebook.com/documentation/business-messaging/whatsapp/groups — Meta for Developers, “Groups API”.

[4]: https://supabase.com/ — Supabase, Postgres, Authentication, Row Level Security, Storage, Realtime e Vector.

[5]: https://www.inngest.com/docs/learn/inngest-functions — Inngest, funções duráveis, eventos, cron, webhooks, retries e steps.

[6]: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data — AI SDK, geração de dados estruturados e validação por schema.

[7]: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview — Meta for Developers, “Webhooks”.
