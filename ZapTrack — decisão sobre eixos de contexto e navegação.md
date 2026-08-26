# ZapTrack — decisão sobre eixos de contexto e navegação

## Decisão

Sim, **Conversas | Grupos**, **Empresas | Pessoas** e **Projetos** devem ser eixos explícitos e de primeira classe na aplicação. Eles representam como profissionais liberais, autônomos, donos e gestores realmente organizam o trabalho:

- a atividade nasce em uma conversa 1:1 ou em um grupo;
- a conversa envolve uma pessoa, empresa ou organização;
- a atividade costuma pertencer a um projeto, cliente, fornecedor, parceria ou iniciativa;
- ações e objetos de gestão são derivados e atravessam esses contextos.

## Navegação recomendada

```text
Agora
Conversas & Grupos
Empresas & Pessoas
Projetos
Áreas
Análises
Controle
```

`Agente` permanece como ação persistente no cabeçalho e como canal, não como eixo de navegação separado.

## Por que é inteligente e eficaz

A estrutura reduz o esforço de lembrar onde uma informação foi classificada. O usuário pode começar pelo chat, pela empresa, pelo projeto ou pelo que precisa de atenção. Todos os caminhos chegam ao mesmo objeto e à mesma evidência.

A aplicação não deve obrigar o usuário a escolher entre uma única classificação. Uma conversa pode ser uma fonte; uma empresa, um contexto relacional; e um projeto, um contexto de trabalho. Esses eixos se complementam.

## Conversas versus grupos

No domínio, grupo é uma especialização de conversa. Na interface, porém, a separação explícita é útil:

```text
Conversas & Grupos
├── Todas
├── 1:1
├── Grupos
├── Não organizadas
├── Com atenção
└── Recentes
```

Cada item deve mostrar fonte/canal, participantes, empresa relacionada, projeto relacionado, último evento relevante, quantidade de objetos derivados e status de processamento.

## Empresa versus pessoa

“Empresa” é o rótulo amigável para organizações externas e a própria organização do workspace. “Pessoa” é o rótulo amigável para contatos individuais. Papéis como cliente, fornecedor, parceiro, colaborador e prospect são relações contextuais.

```text
Pessoa/Organização
├── papéis
├── relações
├── conversas 1:1
├── grupos
├── projetos
├── objetos de gestão
├── arquivos
└── timeline
```

## Projeto como contexto transversal

Projeto não deve ser apenas uma lista de tarefas. É uma coleção contextual que reúne conversas, grupos, empresas, pessoas, decisões, compromissos, documentos, tarefas, riscos e métricas relacionados a um objetivo.

```text
Projeto
├── resumo e objetivo
├── conversas e grupos
├── empresas e pessoas
├── tarefas e compromissos
├── decisões e riscos
├── arquivos
├── timeline
└── indicadores
```

## Regra de não duplicação

A mensagem pertence a uma única conversa de origem. Ela pode ser vinculada a várias empresas/pessoas e a vários projetos por meio de relações e evidências. O sistema deve mostrar views diferentes, não copiar a mensagem.

```text
Message ──belongs_to──> Conversation
Message ──mentions/relates_to──> Party/Organization
Message ──contextualized_by──> Project
Message ──generates──> InteractionEvent
InteractionEvent ──proposes──> ManagementObject
```

## Home revisada

`Agora` continua como página inicial porque responde ao que exige atenção. Porém, o menu principal deve oferecer acesso direto às três perspectivas de contexto:

```text
Agora              = o que exige atenção
Conversas & Grupos = onde a atividade aconteceu
Empresas & Pessoas = com quem a atividade aconteceu
Projetos           = para que/qual objetivo a atividade aconteceu
Áreas              = em que função da empresa a atividade se encaixa
```

## Filtros e agrupamentos

Os mesmos dados podem ser agrupados por:

```text
origem: conversa/grupo
contraparte: empresa/pessoa
contexto: projeto
função: área
estado: pendente/concluído/atrasado
responsável: pessoa/equipe
tempo: hoje/semana/período
```

O usuário não deve escolher uma taxonomia definitiva. Deve poder trocar a lente sem perder contexto.

## Modo profissional liberal/autônomo

Para o usuário solo, ocultar a complexidade de departamentos e iniciar com:

```text
Agora
Conversas & Grupos
Empresas & Pessoas
Projetos
Arquivos
Indicadores
Configurações
```

As áreas são opcionais e podem aparecer quando houver volume ou necessidade.

## Modo dono/gestor de empresa

Para equipes, habilitar:

```text
Agora
Conversas & Grupos
Empresas & Pessoas
Projetos
Áreas
Análises
Controle
```

O mesmo projeto ou empresa pode ser visto por diferentes áreas, com permissões apropriadas.

## Conclusão

A recomendação anterior deve ser ajustada: `Conversas & Grupos` não deve ficar escondido dentro de “Conhecimento”. Deve ser um eixo primário da experiência, junto com `Empresas & Pessoas` e `Projetos`. Esses eixos representam a realidade operacional do usuário; `Áreas`, `Análises` e `Controle` organizam a interpretação, a gestão e a governança sobre essa realidade.
