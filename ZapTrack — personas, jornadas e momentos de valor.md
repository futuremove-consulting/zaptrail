# ZapTrack — personas, jornadas e momentos de valor

## 1. Personas prioritárias

### 1.1 Proprietário/sócio de PME

É responsável pelo resultado e costuma concentrar decisões, relacionamento e exceções no próprio WhatsApp. Não quer aprender um ERP novo nem manter dashboards o dia inteiro. Quer saber o que está escapando, qual decisão precisa tomar e onde estão os riscos.

**Valor principal:** visão de atenção e consulta instantânea pelo WhatsApp, com aplicação para revisão e indicadores.

### 1.2 Gestor de área

Coordena Comercial, Atendimento, Financeiro, Operações, Suprimentos, Pessoas ou Projetos. Precisa acompanhar filas, prazos, responsáveis, gargalos e métricas, sem ler todas as conversas.

**Valor principal:** transformar conversas dispersas em filas de objetos, com owner, estado, prazo, evidência e capacidade de delegação.

### 1.3 Operador/especialista

Executa tarefas, responde clientes, processa pedidos, agenda compromissos, envia documentos, cobra ou atualiza status. Precisa de contexto na hora de agir e não pode depender de uma interpretação opaca.

**Valor principal:** receber o próximo passo certo, com origem e contexto, e concluir o trabalho com poucos cliques ou mensagens.

### 1.4 Administrador de workspace

Configura fontes, permissões, políticas, retenção, taxonomia, áreas, notificações e integrações. É o guardião da confiança e da governança.

**Valor principal:** controlar o que entra, quem vê, o que a IA pode fazer e como auditar tudo.

### 1.5 Analista/consultor

Explora dados históricos, compara períodos, investiga causas e prepara decisões. Precisa cruzar conversas, objetos, pessoas, áreas, métricas e evidências.

**Valor principal:** busca contextual, relações, séries temporais, drill-down e exportação explicável.

## 2. Jornada transversal do produto

```text
Descobrir
  → conectar fonte
  → parear usuário
  → observar organização
  → reconhecer eventos
  → revisar sugestões
  → agir com segurança
  → receber atenção antecipada
  → medir resultado
  → ajustar confiança e políticas
```

O produto não deve começar pedindo que o usuário configure centenas de campos. Deve produzir valor com poucas decisões iniciais: workspace, fonte, pessoas-chave, áreas habilitadas, timezone, permissões e preferência de alertas.

## 3. Jornada 1 — onboarding e primeiro valor

| Etapa | Usuário | ZapTrack | Interface primária | Risco |
|---|---|---|---|---|
| Descoberta | Entende a proposta | Mostra conversa → gestão | Aplicação | Promessa ampla demais |
| Configuração | Cria workspace | Cria organização, timezone e perfil | Aplicação | Fricção inicial |
| Fonte | Conecta/importa canal | Valida escopo, consentimento e status | Aplicação | Fonte não elegível |
| Pareamento | Vincula telefone | Confirma código e workspace | WhatsApp | Acesso indevido |
| Observação | Aguarda processamento | Mostra progresso e limites | Aplicação/WhatsApp | “Caixa preta” |
| Revisão | Confirma 3–5 sugestões | Cria objetos e registra feedback | Aplicação | Falso positivo |
| Primeiro resultado | Consulta pendências | Responde com evidência | WhatsApp | Resposta sem base |

### Anticipatory design

O ZapTrack deve detectar que o onboarding está incompleto e mostrar somente a próxima decisão necessária: “falta confirmar o workspace”, “a fonte está conectada, mas ainda não há conversas elegíveis”, “encontrei 12 objetos para revisar”. Não abrir um wizard com todas as configurações.

### Critério de primeiro valor

O usuário deve conseguir perguntar pelo WhatsApp “o que precisa da minha atenção?” e receber uma resposta baseada em pelo menos uma conversa estruturada, um objeto ou uma evidência real.

## 4. Jornada 2 — conversa vira gestão

```text
Conversa acontece
  → ZapTrack ingere
  → identifica possível ação/evento
  → resolve party e objeto
  → cria interpretação com evidência
  → propõe objeto de gestão
  → usuário confirma/corrige
  → objeto entra na fila/área
  → sistema acompanha estado e prazo
```

### Exemplo

Uma cliente escreve “consigo receber a proposta até sexta?”. O sistema deve identificar pergunta/solicitação, assunto proposta, relação comercial e prazo potencial. Não deve criar automaticamente uma proposta enviada. Pode sugerir um objeto de follow-up ou compromisso de envio, com confiança e evidência.

## 5. Jornada 3 — atenção antecipada

O sistema observa prazos, estados, dependências, ausência de resposta, risco, recorrência e baixa confiança. Quando a regra é satisfeita, cria `AttentionItem`.

```text
Regra detectada
  → avaliar escopo/permissão
  → explicar motivo
  → agrupar com itens semelhantes
  → entregar digest no WhatsApp
  → permitir silenciar, delegar, abrir ou agir
```

### Exemplo de resposta

> Você tem **3 itens que exigem atenção hoje**: uma proposta sem retorno há 5 dias, uma entrega prevista para amanhã sem confirmação e uma cobrança vencida. Quer ver por área ou começar pelo mais urgente?

O alerta não deve apenas notificar. Deve indicar motivo, impacto, evidência e ação segura.

## 6. Jornada 4 — consulta no WhatsApp

### Fluxo nominal

1. Usuário envia uma pergunta em linguagem natural.
2. Agente identifica workspace e escopo.
3. Roteador classifica consulta, comando, confirmação, correção ou ajuda.
4. Ferramentas consultam dados estruturados primeiro.
5. Busca semântica recupera contexto apenas quando necessário.
6. Resposta mostra conclusão, período, frescor e link/evidência.
7. Usuário pode refinar, abrir detalhes ou pedir ação.

### Consultas prioritárias

| Pergunta | Resposta esperada |
|---|---|
| “O que precisa da minha atenção?” | AttentionItems ordenados por impacto/urgência |
| “Quais pendências vencem hoje?” | Tasks/Commitments/Approvals com prazo |
| “O que ficou decidido na reunião?” | Decisions com evidência e participantes |
| “Quem está esperando resposta?” | Parties + objetos sem retorno |
| “Como estão as vendas da semana?” | Métrica definida + drill-down opcional |
| “Quando combinamos a entrega?” | Delivery + time + mensagem de origem |
| “Ache o contrato da Beta.” | Documentos e evidências com permissão |
| “O que o cliente reclamou?” | Complaint/Case + resumo + fonte |

## 7. Jornada 5 — criação, correção e execução

### Criar objeto

O agente identifica a proposta, apresenta o mínimo necessário e cria rascunho ou objeto oficial conforme política.

> Entendi uma tarefa: **enviar proposta para Alfa até sexta**. Responsável: você. Quer criar como pendência interna?

### Corrigir objeto

> Classifiquei como oportunidade, mas a confiança é baixa. Quer salvar como **oportunidade**, **tarefa de follow-up** ou **somente informação**?

### Executar objeto

A execução começa com ação de baixo risco. Ações externas, financeiras, destrutivas ou que alteram compromisso exigem confirmação forte ou aplicação externa.

```text
interpretação
  → confirmação da intenção
  → validação do alvo
  → validação de permissão
  → policy gate
  → execução
  → resultado
  → atualização de estado
```

## 8. Jornada 6 — revisão em massa na aplicação

O gestor entra na aplicação quando o volume ou a ambiguidade ultrapassa a capacidade do WhatsApp:

```text
Revisão da IA
  → filtrar por área/tipo/confiança
  → abrir evidência
  → confirmar/corrigir/rejeitar
  → aplicar em lote quando seguro
  → observar impacto
```

O lote deve agrupar itens semelhantes, mas nunca esconder a possibilidade de revisar evidências individuais.

## 9. Jornada 7 — investigação por entidade

O usuário parte de uma pessoa, organização, pedido, contrato ou conversa e explora a rede relacionada:

```text
Party/Organization
  → relações
  → conversas
  → objetos
  → decisões/compromissos
  → arquivos
  → métricas
  → riscos e próximos passos
```

A aplicação deve mostrar a linha do tempo e oferecer filtros por período e relação. O grafo visual completo é secundário; a timeline e os vínculos nomeados são mais legíveis.

## 10. Jornada 8 — métrica e decisão

```text
Pergunta
  → definição da métrica
  → escolha do escopo
  → cálculo determinístico
  → resultado com frescor
  → drill-down para objetos
  → evidência/conclusão
```

Exemplo: “quantos pedidos atrasaram este mês?” deve apresentar definição de “pedido atrasado”, período, timezone, resultado, lista de pedidos e fontes. O agente não deve inventar métricas a partir de texto livre.

## 11. Jornada 9 — arquivo e documento

```text
Receber/enviar arquivo
  → identificar MIME e checksum
  → armazenar com retenção
  → OCR/transcrição se autorizado
  → extrair entidades e eventos
  → vincular a conversa/party/objeto
  → permitir resumo, busca e ação
```

O WhatsApp serve para encaminhar e perguntar. A aplicação é o local de preview, comparação, versionamento, permissão e auditoria.

## 12. Jornada 10 — incidente ou erro de IA

O usuário deve poder dizer “isso está errado” no WhatsApp ou corrigir na aplicação. A correção cria feedback e nova interpretação sem apagar o histórico.

```text
Erro percebido
  → mostrar objeto/evidência
  → corrigir tipo/campo/party/estado
  → registrar quem corrigiu
  → atualizar objeto
  → recalcular projeções
  → usar feedback na avaliação
```

## 13. Momentos de valor

| Momento | Valor percebido |
|---|---|
| Primeira pergunta respondida | “O sistema realmente encontrou algo nas minhas conversas.” |
| Primeira promessa recuperada | “Não perdi o que combinei.” |
| Primeiro atraso antecipado | “O ZapTrack avisou antes do problema.” |
| Primeira correção respeitada | “A IA aprende meu contexto.” |
| Primeira investigação rápida | “Não preciso procurar em dezenas de chats.” |
| Primeira ação concluída | “A conversa virou trabalho real.” |
| Primeiro relatório explicável | “Posso confiar no número.” |

## 14. Anti-jornadas que o produto deve evitar

Não exigir configuração de uma taxonomia completa antes do primeiro valor. Não pedir que o usuário classifique todas as conversas. Não forçar o usuário a abrir a aplicação para cada ação simples. Não enviar notificações sem motivo ou agrupamento. Não responder com parágrafos longos no WhatsApp. Não executar ação externa sem expor alvo, consequência e confirmação. Não esconder o caminho de volta para a evidência.
