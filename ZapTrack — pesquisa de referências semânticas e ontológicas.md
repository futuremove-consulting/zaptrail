# ZapTrack — pesquisa de referências semânticas e ontológicas

## W3C SKOS

Fonte: https://www.w3.org/TR/skos-reference/

SKOS é um modelo comum para compartilhar e vincular sistemas de organização do conhecimento, como tesauros, taxonomias, esquemas de classificação e assuntos. O modelo representa conceitos identificados por URIs, rótulos em diferentes idiomas, notações, notas, relações entre conceitos, esquemas de conceitos, coleções e mapeamentos para outros esquemas.

Implicação para o ZapTrack: ações, tipos de objeto, papéis, estados, áreas e intenções devem ter conceitos identificáveis, rótulo preferencial, rótulos alternativos/sinônimos, definição, exemplos positivos/negativos, relações hierárquicas/associativas e versão do esquema. SKOS é adequado para o vocabulário controlado e a taxonomia operacional; não substitui a ontologia de regras e relações do domínio.

## W3C RDF 1.1 Primer

Fonte: https://www.w3.org/TR/rdf11-primer/

RDF é um framework para expressar informações sobre recursos, incluindo pessoas, documentos, objetos físicos e conceitos abstratos. O modelo representa afirmações como sujeito–predicado–objeto, permitindo expressar relacionamentos entre recursos e intercambiar significado entre aplicações. RDF suporta grafos, vocabulários, literais e serializações como Turtle e JSON-LD.

Implicação para o ZapTrack: o dado semântico deve ser pensado como grafo de afirmações com sujeitos, predicados, objetos, contexto e proveniência. Não é necessário adotar RDF como banco primário no MVP; o Postgres pode guardar as entidades, relações e eventos, com JSON-LD/RDF como formato de exportação ou interoperabilidade posterior. O padrão reforça a necessidade de IDs estáveis, relações explícitas e separação entre recurso, propriedade e literal.

## W3C OWL 2 Primer

Fonte: https://www.w3.org/TR/owl2-primer/

OWL 2 é uma linguagem de ontologia com significado formal para representar classes, propriedades, indivíduos e valores. Pode expressar hierarquias, disjunções, domínios e ranges de propriedades, restrições de cardinalidade, equivalência/inequivalência, cadeias de propriedades, chaves e axiomas; permite raciocinar para verificar consistência ou explicitar conhecimento implícito. A recomendação também descreve perfis de OWL com diferentes compromissos de expressividade e tratabilidade.

Implicação para o ZapTrack: a ontologia deve distinguir classes, propriedades, indivíduos e valores, e definir ranges/domínios e restrições para evitar incoerências. Entretanto, não é recomendável começar com OWL completo ou raciocinador geral. O MVP deve materializar regras essenciais em schemas/constraints e só usar uma camada OWL/SHACL/RDF posterior para intercâmbio e inferências que comprovadamente tragam valor.

## W3C PROV-O

Fonte: https://www.w3.org/TR/prov-o/

PROV-O é uma ontologia W3C baseada no modelo de proveniência PROV, com classes, propriedades e restrições para representar e intercambiar proveniência. Seu núcleo trabalha com entidades, atividades e agentes e pode ser especializado para diferentes domínios.

Implicação para o ZapTrack: toda afirmação semântica deve registrar proveniência: mensagem/arquivo de origem, atividade de análise, agente humano/IA/sistema que produziu ou alterou o resultado, versão do modelo/taxonomia, horário e relação de derivação. Um objeto de gestão derivado de uma mensagem é uma entidade gerada por uma atividade de processamento, possivelmente revisada por um agente humano e alterada por uma ação posterior. Isso é essencial para confiança, auditoria e explicabilidade.

## W3C Activity Streams 2.0

Fonte: https://www.w3.org/TR/activitystreams-core/

Activity Streams 2.0 define um modelo em JSON para representar atividades potenciais e concluídas. O modelo possui objetos, links, atores, atividades, coleções e extensibilidade. Atividades incluem actor, object, target, origin, result e instrument, e o tipo identifica a ação representada. Objetos podem ter ID, tipo, conteúdo, contexto, datas, localização, anexos e relações.

Implicação para o ZapTrack: o desenho de eventos pode aproveitar a separação actor–object–target–result–instrument e a distinção entre uma atividade que pode ocorrer e uma atividade concluída. O modelo do ZapTrack precisa ir além de Activity Streams com estado operacional, compromisso, evidência, confiança e governança, mas a estrutura é uma boa referência para eventos e ações serializáveis.

## W3C JSON-LD 1.1

Fonte: https://www.w3.org/TR/json-ld11/

JSON-LD 1.1 é um formato JSON para serializar Linked Data, com contextos, IRIs, identificadores de nós, tipos, aliases, valores tipados e mecanismos de compactação/expansão. Foi desenhado para integrar dados vinculados a aplicações JSON existentes.

Implicação para o ZapTrack: os contratos internos podem permanecer em JSON/TypeScript/Postgres, mas devem ter IDs estáveis e um contexto JSON-LD exportável. Isso cria interoperabilidade futura sem obrigar o MVP a operar em RDF ou SPARQL. A compactação ajuda o produto a expor representações legíveis enquanto preserva semântica formal.

## W3C SHACL

Fonte: https://www.w3.org/TR/shacl/

SHACL define uma linguagem para validar grafos RDF contra condições expressas como shapes. O modelo separa shapes graph e data graph; shapes podem ser usadas para validação, construção de interfaces, geração de código e integração de dados. A validação produz relatório com conformidade, nó, caminho, valor, shape, componente de restrição, mensagem e severidade.

Implicação para o ZapTrack: schemas e constraints devem ser tratados como ativos do produto. No MVP, Zod/JSON Schema e constraints SQL podem cumprir essa função; futuramente SHACL pode validar um grafo semântico exportado ou uma camada de interoperabilidade. A ideia de severidade é especialmente útil para diferenciar dados incompletos, inconsistências e riscos críticos antes de criar ou executar objetos.

## Schema.org Action

Fonte: https://schema.org/Action

Schema.org define Action como uma ação realizada por um agente direto e participantes indiretos sobre um objeto direto; pode ocorrer em local, com instrumento, produzir resultado e ter status. Suas propriedades incluem agent, object, participant, provider, instrument, target, result, startTime, endTime, location, error e actionStatus.

Implicação para o ZapTrack: o evento semântico deve separar `actor`, `participants`, `object`, `target`, `instrument`, `result`, tempo, local, erro e status. Esse padrão é útil para solicitações, pagamentos, entregas, chamadas, aprovações e ações executadas, mas o ZapTrack deve adicionar evidência conversacional, intenção/proposta, confiança, compromisso, autorização e proveniência.

## Schema.org Event

Fonte: https://schema.org/Event

Schema.org Event representa algo que acontece em determinado tempo e local e oferece propriedades para assunto, participantes, organizador, público, local, modo de presença, agenda recorrente, status, startDate, endDate, duração, subeventos e super-eventos. A documentação destaca `eventStatus` para cancelamentos e reagendamentos e `previousStartDate` para preservar a data anterior.

Implicação para o ZapTrack: reuniões, ligações, visitas, entregas e outros acontecimentos temporais devem modelar início/fim, timezone, local, participantes, recorrência, estado, histórico de reagendamento e referência à conversa que registrou o evento. Perguntas/propostas de agenda devem permanecer distintas de eventos confirmados.

## Microsoft Dynamics 365 Sales

Fonte: https://learn.microsoft.com/en-us/dynamics365/sales/developer/sales-entities-lead-opportunity-competitor-quote-order-invoice

A documentação oficial organiza entidades de vendas para diferentes fases do processo: lead, oportunidade, concorrente, cotação, pedido, produto, fatura e metas. A separação explicita que um processo comercial é composto por entidades relacionadas e não por uma única classificação de mensagem.

Implicação para o ZapTrack: conversas podem gerar objetos em diferentes estágios do processo, e o modelo deve distinguir oportunidade, proposta, pedido, produto, fatura e pagamento, mantendo relações entre eles. O ZapTrack não deve substituir um ERP no MVP, mas precisa capturar eventos conversacionais e links para registros transacionais.

## HubSpot CRM objects

Fonte: https://knowledge.hubspot.com/records/understand-objects

A documentação oficial descreve objetos como representação de clientes e informações de processos de negócio, incluindo contatos, negócios, assinaturas, atividades, pagamentos e conversas. Também descreve propriedades e associações e informa que objetos compartilham a mesma plataforma de dados, permitindo associar registros e criar relatórios.

Implicação para o ZapTrack: o núcleo deve utilizar objetos tipados, propriedades e associações flexíveis sobre uma base comum. A relação entre uma mensagem, um contato, uma empresa, uma atividade, uma oportunidade, um pagamento ou uma conversa deve ser explícita. A capacidade de objetos customizados inspira uma camada de extensão, mas não deve levar o MVP a permitir schemas arbitrários sem governança.

## W3C Organization Ontology (ORG)

Fonte: https://www.w3.org/TR/vocab-org/

A ontologia ORG fornece um núcleo reutilizável para estruturas organizacionais, com organização, unidades organizacionais, membros, membership, papéis, cargos/posts, relações de reporte, sites, colaboração organizacional e eventos de mudança. A W3C destaca que a ontologia é genérica e deve ser estendida por perfis e vocabulários específicos, pois não prescreve uma classificação única para tipos de organização, propósito ou papéis.

Implicação para o ZapTrack: não modelar colaborador apenas como `user` nem cliente/fornecedor apenas como um tipo global imutável. Usar `Party`/agente e uma entidade contextual de `PartyRole` ou `Membership`, que liga pessoa/organização a workspace, unidade, papel, período e autoridade. A mesma pessoa pode ser cliente em uma relação, colaborador em outra e representante de fornecedor em outra. Unidades, sites e histórico organizacional precisam ser entidades próprias quando forem relevantes para roteamento, permissão e contexto.

## W3C OWL-Time

Fonte: https://www.w3.org/TR/owl-time/

OWL-Time modela entidades temporais como instantes e intervalos, com início, fim, duração, posição temporal, sistema de referência, relações como antes/depois e outras relações entre intervalos. O vocabulário permite associar informações temporais a atividades, eventos e entidades, e suporta duração, timezone e calendários.

Implicação para o ZapTrack: cada evento e objeto com dimensão temporal deve distinguir instante, intervalo, prazo e recorrência. Agendamento, reunião, ligação, entrega, cobrança e pagamento precisam preservar timezone, início/fim, duração, deadline, precisão da data e histórico de reagendamento. “Amanhã” deve ser normalizado de acordo com o timezone do workspace, mantendo a expressão original e a confiança.

## IETF RFC 5545 — iCalendar

Fonte: https://datatracker.ietf.org/doc/html/rfc5545

O RFC 5545 define o formato iCalendar para intercâmbio de eventos e tarefas. Os componentes incluem VEVENT e VTODO, com propriedades para início/fim, prazo, status, organizador, participantes, regra de recorrência e identificação de uma instância específica de evento recorrente.

Implicação para o ZapTrack: objetos de agenda e tarefa devem ser compatíveis conceitualmente com `DTSTART`, `DTEND`, `DUE`, `STATUS`, `ORGANIZER`, `ATTENDEE`, `RRULE` e `RECURRENCE-ID`. O sistema deve conservar recorrência como regra e instâncias, e registrar reagendamento sem destruir a data anterior.

## Schema.org Order

Fonte: https://schema.org/Order

Schema.org define Order como confirmação de uma transação/recibo que pode conter múltiplos itens. O tipo inclui oferta aceita, comprador/cliente, vendedor, corretor, número, data, status, itens, entrega, endereço de faturamento, fatura relacionada, data de vencimento, método e URL de pagamento.

Implicação para o ZapTrack: pedido deve ser entidade própria, ligada a ofertas/itens, comprador, vendedor, cobrança/fatura, pagamento e entrega. “Pedido solicitado”, “pedido aprovado”, “pedido confirmado” e “pedido entregue” são estados e eventos diferentes. Um único pedido pode ter vários itens e entregas, e uma fatura pode consolidar vários pedidos.

## GS1 EPCIS

Fontes: https://ref.gs1.org/standards/epcis/ e https://www.gs1.org/standards/epcis-and-cbv-implementation-guideline/current-standardd

EPCIS define um modelo e interfaces para capturar e compartilhar dados de visibilidade de eventos dentro e entre organizações. A diretriz estrutura eventos em dimensões WHAT, WHEN, WHERE e WHY e descreve eventos como registros da conclusão de passos de processos de negócio. A versão corrente do repositório GS1 deve ser consultada antes de uma integração específica, pois o padrão evolui.

Implicação para o ZapTrack: eventos de pedido, compra, recebimento, envio e entrega podem usar o mesmo padrão semântico de “o quê, quando, onde e por quê”, acrescido de quem, relação, evidência e estado. O ZapTrack não precisa implementar EPCIS no MVP, mas deve manter campos compatíveis e permitir mapeamento futuro para visibilidade interorganizacional.
