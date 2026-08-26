# ZapTrack — modelo mental e princípios de experiência

## Decisão central

O ZapTrack possui **duas interfaces e um único produto**:

- o agente no WhatsApp é o modo mais rápido de perguntar, confirmar, registrar, acompanhar e agir;
- a aplicação externa é o modo de enxergar, revisar, investigar, configurar, aprovar e analisar em profundidade;
- o núcleo semântico compartilhado é a única fonte de verdade.

## Modelo mental do usuário

O usuário não pensa em `InteractionEvent`, ontologia ou pipeline semântico. Ele pensa em quatro perguntas:

1. **O que aconteceu?** Conversas, pedidos, decisões, reclamações, compromissos e mudanças.
2. **O que precisa da minha atenção?** Pendências, atrasos, riscos, aprovações e oportunidades.
3. **O que preciso fazer agora?** Confirmar, delegar, responder, aprovar, lembrar, registrar ou executar.
4. **Onde encontro a prova?** Conversa, mensagem, áudio, arquivo, documento ou sistema de origem.

A aplicação deve traduzir o núcleo semântico para esse modelo mental, sem expor a complexidade da ontologia como navegação principal.

## Princípios de organização

### Organizar por áreas, não por agentes

O usuário acessa Financeiro, Comercial, Atendimento, Operações, Pessoas, Suprimentos, Projetos e Diretoria. Dentro de cada área encontra objetos, conversas, tarefas, documentos, pessoas, indicadores e agentes contextualizados.

Agentes são capacidades transversais e devem aparecer como assistente contextual, não como a espinha dorsal do app.

### Organizar por atenção antes de organizar por cadastro

O primeiro valor está em mostrar o que mudou, venceu, está bloqueado, exige decisão ou tem risco. Cadastros, relatórios e configurações vêm depois.

### Progressive disclosure

O WhatsApp entrega conclusão, contexto curto, evidência e próximo passo. A aplicação abre a profundidade somente quando necessário: histórico, relações, múltiplas evidências, revisão em massa, autorização e análise.

### Conversas e objetos são duas vistas do mesmo fato

A conversa é a origem e a evidência. O objeto de gestão é a estrutura acompanhável. O usuário deve conseguir ir nos dois sentidos: objeto → evidência e conversa → objetos derivados.

### Um verbo, uma intenção de interface

“Consultar”, “revisar”, “criar”, “atribuir”, “aprovar”, “concluir”, “cancelar”, “reagendar”, “exportar” e “configurar” são ações explícitas. O sistema não deve esconder mudança de dados atrás de uma resposta conversacional ambígua.

### Confiança visível

Toda interpretação importante deve mostrar origem, confiança, estado de revisão e o que ainda falta confirmar. A IA nunca deve parecer uma autoridade invisível.

## Hierarquia de navegação proposta

```text
Agora
├── Visão geral
├── Atenção
├── Minha agenda
└── Minhas pendências

Áreas
├── Comercial
├── Atendimento
├── Financeiro
├── Operações
├── Suprimentos
├── Pessoas
├── Projetos
└── Diretoria

Conhecimento
├── Conversas
├── Objetos de gestão
├── Pessoas e organizações
├── Arquivos e documentos
└── Busca global

Análise
├── Indicadores
├── Relatórios
├── Tendências
└── Histórico de decisões

Controle
├── Revisão da IA
├── Aprovações
├── Automações
├── Fontes e integrações
├── Permissões e privacidade
└── Configurações

Assistente
└── Agente contextual / abrir no WhatsApp
```

A navegação primária deve ter poucas entradas fixas. Áreas aparecem como agrupadores de contexto; não se deve criar um menu com dezenas de módulos ou agentes.

## Dois modos de entrada

### Modo diário

O usuário começa em `Agora`: atenção, agenda, pendências, decisões e oportunidades de hoje. Pode seguir trabalhando pelo WhatsApp.

### Modo investigação

O usuário começa em `Busca global`, `Conversas`, `Objetos` ou uma área específica e percorre relações, evidências, histórico e métricas.

## Estados que devem ser tratados como produto

Toda tela deve contemplar carregando, vazio, sem permissão, baixa confiança, conflito de identidade, objeto arquivado, erro de sincronização, ação pendente de aprovação, ação concluída, ação falha e evidência indisponível.

## Linguagem de interface

Usar “conversas”, “assuntos”, “pendências”, “decisões”, “compromissos”, “pedidos”, “pagamentos”, “entregas”, “pessoas”, “documentos” e “indicadores”. Deixar `InteractionEvent`, `ManagementObject`, `proveniência` e `taxonomia` para áreas avançadas, documentação e administração.

## Promessa de experiência

> O ZapTrack organiza o que foi conversado, mostra o que exige atenção e permite transformar decisões em próximos passos — pelo WhatsApp ou pela aplicação, sempre com contexto e evidência.
