# ZapTrack — jornadas por contexto para autônomos e gestores

## 1. Princípio

A jornada deve seguir a realidade do trabalho, não um formulário de software:

```text
conversa acontece
  → contexto é reconhecido
  → ação/objeto é estruturado
  → informação fica encontrável
  → próximo passo é acompanhado
  → resultado volta para a timeline
```

O usuário pode começar pela conversa/grupo, pela empresa/pessoa, pelo projeto ou pelo alerta. A experiência deve levar todas as entradas ao mesmo objeto e à mesma evidência.

## 2. Jornada do profissional liberal/autônomo

### Perfil operacional

O profissional liberal trabalha com poucos clientes, muitos contatos paralelos, múltiplos projetos e pouco tempo para atualizar CRM. Geralmente usa conversas 1:1 e grupos de projeto; a mesma pessoa pode ser cliente, parceiro, fornecedor ou correspondente em momentos diferentes.

### Jornada diária

```text
Manhã
  → abrir Agora ou perguntar ao agente
  → ver compromissos e pendências
  → revisar quem aguarda resposta

Durante o dia
  → conversar com clientes/parceiros/fornecedores
  → encaminhar arquivo ou registrar contexto
  → confirmar ou corrigir objetos sugeridos
  → concluir tarefas pelo WhatsApp

Fim do dia
  → receber resumo de decisões e pendências
  → revisar projetos em risco
  → criar lembretes para o dia seguinte
```

### Fluxo por cliente

```text
Empresas & Pessoas
  → selecionar cliente
  → ver conversas 1:1 e grupos
  → ver projetos/client cases
  → ver compromissos, documentos e pendências
  → abrir evidência
  → executar próximo passo
```

### Fluxo por projeto

```text
Projetos
  → criar “Espaço do cliente” ou projeto formal
  → associar conversa/grupo
  → adicionar pessoas/empresa
  → acompanhar objetos
  → registrar decisão/marco
  → revisar cronograma e riscos
```

O sistema deve sugerir criação de um “Espaço do cliente” quando detectar conversas recorrentes, arquivos, prazos e tarefas de uma mesma organização, mas não deve obrigar o usuário a criar um projeto formal.

## 3. Jornada do dono/gestor de PME

### Perfil operacional

O dono/gestor coordena equipe, clientes, parceiros e fornecedores em diversos grupos. Precisa de visão consolidada, mas não quer ler todas as conversas. Usa Agora e indicadores para governar e WhatsApp para decisões rápidas.

### Jornada diária

```text
Agora
  → prioridades e exceções
  → pendências por responsável
  → aguardando cliente/fornecedor/equipe
  → decisões que exigem aprovação

Por área
  → Comercial / Atendimento / Financeiro / Operações
  → filas e indicadores
  → abrir conversa ou projeto relacionado

Por relação
  → cliente/fornecedor/parceiro
  → histórico e compromissos
  → risco e próximos passos

Por projeto
  → progresso
  → decisões, riscos, documentos e responsáveis
```

### Fluxo de delegação

```text
gestor identifica pendência
  → abre objeto/evidência
  → escolhe responsável
  → define prazo e contexto
  → confirma delegação
  → colaborador recebe aviso
  → colaborador atualiza/conclui
  → gestor acompanha sem ler conversa inteira
```

## 4. Jornada de Conversas & Grupos

```text
Conversas & Grupos
  → escolher 1:1 ou grupo
  → filtrar por empresa/pessoa/projeto
  → identificar assuntos e objetos
  → abrir resumo
  → navegar para objeto
  → voltar para mensagem/evidência
```

A lista de grupos deve mostrar participante principal, empresa, projeto, último assunto relevante, pendências, decisões e última atividade. A lista de conversas 1:1 deve mostrar contraparte, papéis, projetos relacionados e pendências abertas.

## 5. Jornada de Empresa/Pessoa

```text
Empresa/Pessoa
  → buscar por nome/alias/telefone
  → revisar identidade e papéis
  → abrir relações
  → ver conversas e grupos
  → filtrar por projeto
  → ver objetos e documentos
  → ver timeline
  → agir ou abrir contexto
```

Se uma pessoa aparecer como contato de duas empresas, o sistema não deve fundir silenciosamente os contextos. Deve mostrar a relação por organização e permitir confirmação.

## 6. Jornada de Projeto

```text
Projeto
  → resumo/objetivo
  → conversas e grupos
  → pessoas e empresas
  → tarefas/compromissos
  → decisões/riscos
  → arquivos
  → timeline
  → indicadores
```

Um projeto deve responder em poucos segundos:

```text
o que está acontecendo?
quem está envolvido?
o que foi decidido?
o que está pendente?
o que está atrasado?
qual é o próximo marco?
qual conversa prova isso?
```

## 7. Jornada cross-context

O principal valor aparece quando o usuário alterna as lentes:

```text
Grupo “Implantação Alfa”
  → empresa Alfa
  → projeto Implantação Alfa
  → 6 pendências
  → 2 decisões
  → 1 entrega atrasada
  → abrir evidência
  → delegar tarefa
```

O breadcrumb deve preservar o caminho:

```text
Projetos / Implantação Alfa / Conversas / Grupo Implantação
```

E permitir voltar para:

```text
Grupo → Projeto → Alfa → Objeto → Evidência
```

## 8. Jornada de mudança de contexto dentro de grupo

Grupos têm ruído e assuntos paralelos. O produto deve suportar:

```text
grupo
  → assunto A / projeto A
  → assunto B / projeto B
  → mensagem fora de contexto
  → associação específica por thread/período
```

O usuário pode dizer:

> “Essa mensagem não é do projeto Alfa; associe ao projeto Beta.”

O sistema registra a exceção e não reclassifica o grupo inteiro.

## 9. Jornada de informação não estruturada

```text
mensagem informal
  → reconhecer que pode ser apenas conversa
  → sugerir objeto apenas se houver valor
  → mostrar “não encontrei ação clara” quando apropriado
  → permitir registrar manualmente
```

O sucesso não é transformar tudo em tarefa; é fazer com que nada importante se perca e que o ruído não vire trabalho falso.

## 10. Jornada de equipe

### Colaborador

Recebe uma tarefa com contexto, evidência, prazo e projeto. Pode atualizar pelo WhatsApp ou aplicação. O sistema não exige que ele reconstrua o histórico.

### Gestor

Vê fila por responsável, atraso e dependências. Pode abrir a conversa que originou o item, não apenas um título sem contexto.

### Dono

Vê atenção consolidada e indicadores. Pode perguntar pelo WhatsApp “o que está travando os projetos?” e receber resposta agregada com drill-down.

## 11. Jornada de captura rápida pelo agente

```text
usuário encaminha mensagem/áudio/documento
  → agente confirma recebimento
  → identifica possível empresa/projeto
  → pergunta somente se ambíguo
  → cria sugestão ou objeto
  → oferece “ver no projeto”
```

Exemplo:

> Recebi o áudio. Ele parece tratar da **entrega do projeto Alfa** e menciona um atraso para sexta. Quer que eu registre como **ocorrência de entrega** ou apenas arquive no projeto?

## 12. Jornada de confiança e correção

```text
sugestão
  → usuário vê evidência
  → aceita/corrige/rejeita
  → relação/objeto atualiza
  → views de conversa, empresa e projeto atualizam
```

Uma correção realizada dentro do projeto deve refletir na conversa e na empresa relacionada. Não há correção isolada por tela.

## 13. Jornada de resumo antecipatório

O resumo deve ser contextual:

- por conversa/grupo: “o que foi discutido e ficou pendente”;
- por empresa: “o que está em aberto com este cliente/fornecedor”;
- por projeto: “o que mudou, atrasou ou exige decisão”;
- por gestor: “o que exige atenção da empresa”.

## 14. Critério de sucesso

A jornada é eficaz quando o usuário consegue começar por qualquer contexto e responder:

```text
qual é o assunto?
com quem é?
a qual projeto pertence?
qual é o estado?
quem precisa agir?
quando?
qual é a evidência?
```

Sem exigir que ele saiba previamente qual menu, área ou módulo contém a informação.
