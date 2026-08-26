# ZapTrack — arquitetura de dupla interface

## 1. Reenquadramento do produto

O ZapTrack passa a ser um produto com duas interfaces complementares:

> **WhatsApp é a interface de velocidade e proximidade. A aplicação externa é a interface de profundidade, controle e observabilidade.**

Nenhuma das interfaces deve possuir banco, regras de negócio, memória ou automações próprias. Ambas consultam e alteram o mesmo núcleo de domínio.

## 2. Dois papéis do WhatsApp

Há uma distinção arquitetural crítica entre:

| Papel | O que representa |
|---|---|
| **WhatsApp como fonte de dados** | Conversas empresariais, mensagens, mídias e eventualmente histórico que serão organizados pelo ZapTrack. |
| **WhatsApp como interface do agente** | O canal pelo qual o usuário pergunta, consulta, recebe alertas e confirma ações do ZapTrack. |

O agente deve preferencialmente ter um **número próprio do ZapTrack**. Não misturar no mesmo número, no primeiro ciclo, o tráfego bruto do negócio, mensagens de clientes e comandos do gestor ao agente. Separar os papéis reduz ambiguidade, evita loops e simplifica identidade, consentimento, auditoria e suporte.

## 3. Princípio de paridade

Tudo que pode ser feito no WhatsApp deve ser feito pela mesma camada de domínio usada pela aplicação, e tudo que existe na aplicação deve poder ser consultado pelo agente quando houver permissão e uma representação adequada no canal.

| Capacidade | Agente no WhatsApp | Aplicação externa |
|---|---|---|
| Consultar conversas | Pergunta natural e comandos curtos | Busca, filtros, timeline e contexto completo |
| Consultar objetos | “Quais pendências vencem hoje?” | Feed, tabela, quadro e detalhe |
| Criar/editar objeto | Conversa com confirmação | Formulário, edição em lote e histórico |
| Consultar métricas | Pergunta com período e definição | Dashboard, drill-down e exportação |
| Consultar arquivos | Busca, resumo e envio controlado | Biblioteca, preview, OCR/transcrição e gestão |
| Receber alertas | Mensagens/digest | Feed, regras e preferências |
| Configurar políticas | Somente ajustes simples e seguros | Tela de configuração e auditoria |
| Auditar | Resumo e link para detalhe | Trilha completa, filtros e exportação |
| Explorar relações | Resposta textual com evidência | Grafo/timeline/tabelas quando fizer sentido |

## 4. Núcleo compartilhado

O backend deve ser organizado em cinco planos:

1. **Data plane:** ingestão de mensagens, arquivos, análises e eventos.
2. **Knowledge plane:** contexto, entidades, evidências, embeddings e objetos de gestão.
3. **Action plane:** comandos, permissões, confirmação, execução e reversão.
4. **Agent plane:** interpretação da pergunta, seleção de ferramentas, recuperação e composição da resposta.
5. **Experience plane:** renderização no WhatsApp e na aplicação.

O Agent plane não pode acessar banco diretamente. Ele chama ferramentas de domínio tipadas, cada uma com escopo, auditoria e política.

## 5. Fluxos principais

### 5.1 Ingestão de conversa empresarial

```text
WhatsApp Business App/Cloud API ou importação
                 ↓
Webhook/import endpoint
                 ↓
Persistir payload + deduplicar
                 ↓
Job assíncrono
                 ↓
Normalizar → contextualizar → extrair → criar proposta
                 ↓
Objeto de gestão + evidência + atenção
```

### 5.2 Consulta do agente

```text
Usuário envia pergunta para número do ZapTrack
                 ↓
Webhook de mensagem do agente
                 ↓
Resolver telefone → membro → workspace → permissões
                 ↓
Classificar intenção e risco
                 ↓
Chamar ferramentas de consulta
                 ↓
Responder com dados atuais, evidência e frescor
```

### 5.3 Ação pelo agente

```text
Usuário: “Crie uma tarefa para retornar ao cliente amanhã”
                 ↓
Interpretar comando
                 ↓
Validar evidência, owner, prazo e permissão
                 ↓
Criar proposta/rascunho
                 ↓
Pedir confirmação se necessário
                 ↓
Executar comando de domínio
                 ↓
Responder com objeto criado e identificador
                 ↓
Registrar auditoria e feedback
```

## 6. Ferramentas do agente

O agente deve operar por um catálogo pequeno, explícito e tipado:

| Ferramenta | Tipo | Permissão inicial |
|---|---|---|
| `search_conversations` | Consulta | Membro |
| `search_messages` | Consulta | Membro, conforme escopo |
| `get_evidence` | Consulta | Membro |
| `list_management_objects` | Consulta | Membro |
| `get_management_object` | Consulta | Membro |
| `list_attention_items` | Consulta | Membro |
| `get_metric` | Consulta | Gestor/admin, conforme dado |
| `search_files` | Consulta | Conforme pasta/tenant |
| `get_file_summary` | Consulta | Conforme permissão |
| `create_object_draft` | Escrita reversível | Membro |
| `update_object` | Escrita | Owner ou gestor |
| `complete_object` | Escrita | Owner ou gestor |
| `create_internal_reminder` | Escrita | Membro |
| `send_digest` | Ação | Gestor/admin |
| `export_data` | Ação sensível | Admin, confirmação forte |
| `update_external_system` | Ação externa | Política aprovada + confirmação |
| `send_customer_message` | Ação externa | Bloqueada no MVP ou confirmação explícita |

Não oferecer ferramenta `run_sql`, `execute_code`, `search_everything_without_scope` ou um tool genérico que aceite qualquer ação. O agente deve trabalhar com comandos de negócio.

## 7. Respostas no WhatsApp

Toda resposta deve ter, quando aplicável:

- conclusão direta;
- período e escopo consultados;
- quantidade encontrada;
- itens prioritários;
- evidência ou referência à conversa;
- data de atualização/frescor;
- próxima ação disponível.

Exemplo:

> **Você tem 4 pendências vencendo hoje.**
> 1. Enviar proposta para Alfa — responsável: Gus — origem: conversa de 12/08.
> 2. Retornar ligação para Beta — sem responsável — origem: grupo “Vendas” encaminhado em 13/08.
>
> Posso criar os lembretes internos. Responda **CRIAR 1 E 2**.

O canal deve suportar respostas compactas e progressivas: primeiro resumo, depois detalhes sob demanda. Arquivos grandes, tabelas extensas, dashboards e auditorias completas devem oferecer link seguro para a aplicação externa.

## 8. Memória do agente

Separar três memórias:

| Memória | Conteúdo | Retenção |
|---|---|---|
| Memória da conversa com o agente | Perguntas, respostas, confirmações e contexto curto | Configurável |
| Memória operacional | Objetos, status, prazos, decisões, owners e ações | Longa, conforme política |
| Memória semântica | Embeddings, entidades, relações e análises versionadas | Conforme origem e retenção |

A conversa com o agente não deve ser a fonte de verdade. Se o usuário disser “conclua aquele item”, o sistema deve resolver a referência pelo workspace, histórico e estado atual; se houver ambiguidade, deve perguntar antes de agir.

## 9. Identidade e pareamento

O número de telefone do remetente identifica um possível usuário, mas não deve conceder acesso automaticamente a um workspace. O onboarding recomendado é:

1. Usuário cria ou entra no workspace na aplicação.
2. Aplicação exibe um código/QR/link de pareamento.
3. Usuário envia o código ao número do agente.
4. Backend valida o código de uso único e vincula `phone_number_hash` a `member_id` e `workspace_id`.
5. Futuras mensagens são autorizadas por esse vínculo.
6. Troca de workspace ou privilégio exige comando explícito e, para ações sensíveis, nova confirmação.

O agente deve reconhecer identidade, workspace, papel, escopo de dados e estado de consentimento antes de chamar qualquer ferramenta.

## 10. Limite oficial do acesso ao WhatsApp do usuário

O conceito “consultar tudo do próprio WhatsApp” precisa ser dividido em fontes. A documentação oficial de coexistência do WhatsApp Business App prevê compartilhamento de histórico quando o cliente concorda, mas o histórico documentado não inclui mensagens de grupos.[1] A documentação da Groups API trata de grupos criados/geridos pela própria API, com elegibilidade e limites específicos; ela não equivale a acesso a grupos comuns já existentes no WhatsApp pessoal ou no WhatsApp Business App.[2]

Logo, o produto deve comunicar:

- **Mensagens empresariais elegíveis:** podem ser sincronizadas por caminho oficial de coexistência/Cloud API, conforme consentimento e limites.
- **Conversas do agente:** sempre disponíveis no número do agente.
- **Grupos comuns:** somente por encaminhamento, importação ou integração oficialmente elegível e comprovada.
- **WhatsApp pessoal:** não prometer leitura invisível ou total por API oficial.

## 11. Aplicação externa como painel de controle

A aplicação deixa de ser “obrigatória para cada consulta” e passa a ser a sede de profundidade:

- onboarding e pareamento;
- escolha de fontes e escopos;
- revisão de objetos de baixa confiança;
- exploração da conversa completa;
- pesquisa e filtros avançados;
- edição em lote;
- relatórios e métricas detalhadas;
- biblioteca de arquivos;
- permissões, retenção e exportação;
- auditoria e configurações do agente;
- aprovação de automações e integrações.

A interface externa também serve como mecanismo de recuperação quando a conversa no WhatsApp se torna longa, ambígua ou sensível.

## 12. Regra de ouro

> **WhatsApp é o cockpit; a aplicação é o centro de comando; o núcleo compartilhado é a única fonte de verdade.**

O usuário pode viver no WhatsApp sem perder governança, e pode abrir a aplicação sem encontrar um sistema diferente. As duas experiências devem parecer duas janelas do mesmo ZapTrack.
