# ZapTrack — filtros, agrupamentos e busca da timeline

## 1. Princípio de filtragem

A timeline deve reduzir o ruído sem apagar a realidade. Filtrar significa mudar a leitura da conversa, não modificar a fonte original.

```text
fonte original imutável
  → consulta/filtros
  → timeline derivada
  → seleção/foco
  → mostrar na conversa
```

Cada filtro deve ser reversível, visível e combinável. A interface deve mostrar quando a timeline está filtrada e quantos itens ficaram ocultos.

## 2. Barra de filtros

A barra compacta deve conter:

```text
Período | Tipo | Intenção | Ação | Objeto | Arquivo | Pessoa | Empresa | Projeto | Status | Mais filtros
```

Filtros ativos aparecem como chips removíveis:

```text
Projeto: Implantação Alfa ×
Tipo: Decisão ×
Período: últimos 30 dias ×
```

`Limpar filtros` deve estar sempre disponível.

## 3. Filtro de período

Presets:

```text
Hoje
Ontem
Últimos 7 dias
Últimos 30 dias
Este mês
Mês anterior
Trimestre
Intervalo personalizado
Desde o início da conversa
```

O período deve declarar qual timestamp foi utilizado:

```text
Período aplicado à data da mensagem
Período aplicado à data do evento
Período aplicado ao prazo/estado
```

Para consultas naturais, o agente deve explicar a interpretação de expressões como “esta semana”, “antes da reunião” e “desde o pagamento”.

## 4. Filtro semântico

### Intenções/atos

```text
pergunta
solicitação
informação
proposta
compromisso
aprovação
cancelamento
reagendamento
reclamação
elogio
feedback
decisão
```

### Ações

```text
agendar
cancelar
reagendar
comprar
contratar
aprovar
vender
cobrar
pagar
entregar
enviar
receber
revisar
atribuir
concluir
```

### Objetos

```text
tarefa
compromisso
reunião
ligação
oportunidade
pedido
compra
contrato
fatura
pagamento
entrega
caso
reclamação
decisão
risco
```

### Conteúdos

```text
arquivo
áudio
imagem
documento
proposta
contrato
comprovante
link
```

A taxonomia exibida pode ser menor que a taxonomia interna. A interface deve agrupar termos avançados sob “Mais tipos”.

## 5. Filtro por contexto

```text
pessoa
empresa/organização
papel: cliente/fornecedor/parceiro/colaborador
projeto/espaço do cliente
área
responsável
grupo 1:1
fonte
```

O usuário pode filtrar por grupo e empresa simultaneamente. Exemplo:

```text
Grupo: Implantação Alfa
Empresa: Alfa Tecnologia
Projeto: Implantação Alfa
```

## 6. Filtro por estado e atenção

```text
sugerido
em revisão
confirmado
aberto
em andamento
bloqueado
atrasado
concluído
cancelado
sem retorno
aguardando aprovação
sem evidência
```

“Sem retorno” deve ser uma inferência explicável, com intervalo de silêncio e fonte de comparação. Não apresentar como fato absoluto.

## 7. Palavra-chave e busca semântica

O campo suporta três modos:

| Modo | Resultado |
|---|---|
| Literal | Encontra palavras e frases presentes |
| Estruturado | Interpreta filtros e tipos |
| Semântico | Encontra significado relacionado |

Quando o usuário escreve “atraso de entrega”, a interface pode mostrar:

```text
Busca por significado: atraso + entrega
Filtros sugeridos: ação = entregar; status = atrasado
```

Resultados devem informar `correspondência exata`, `filtro estruturado` ou `significado semelhante`.

## 8. Agrupamentos

Agrupamentos disponíveis:

```text
por dia
por semana
por assunto
por intenção
por ação
por objeto
por projeto
por empresa
por pessoa
por estado
por arquivo
```

A ordenação temporal padrão permanece cronológica. Agrupamento por assunto é uma camada visual; não altera a ordem real dos eventos.

## 9. Cards da timeline

```text
┌─────────────────────────────────────────────────────────┐
│ 27/08 · 14:32 · Decisão confirmada                     │
│ Projeto Alfa aprovado para iniciar em 01/09             │
│ Projeto: Implantação Alfa · Empresa: Alfa               │
│ Fonte: 3 mensagens · confiança alta                    │
│ [Ver evidência] [Abrir objeto] [Mostrar na conversa]    │
└─────────────────────────────────────────────────────────┘
```

Para itens de IA, mostrar uma razão curta:

```text
Identificado porque: “aprovado”, “podemos iniciar” e resposta de Ana.
```

## 10. Timeline sem filtro

A versão sem filtro mostra a sequência completa da conversa, incluindo mensagens sem classificação. Itens estruturados recebem marcadores, mas nenhuma mensagem desaparece.

## 11. Timeline filtrada

A versão filtrada deve mostrar:

```text
18 itens encontrados · 7 exibidos · 11 mensagens de contexto ocultas
[mostrar contexto]
```

Quando o usuário abre um item, a aplicação pode expandir automaticamente mensagens de contexto necessárias e sinalizar que são contexto, não resultados diretos.

## 12. Modo foco

Ao abrir um objeto ou evidência, oferecer `Modo foco`:

```text
item principal
→ evidência direta
→ contexto anterior
→ contexto posterior
→ objeto/ação
```

O modo foco é útil para decisões, reclamações, aprovações e compromissos longos.

## 13. Busca salva

Permitir salvar filtros e agrupamentos como views:

```text
Entregas atrasadas do projeto Alfa
Decisões sem execução
Arquivos de contrato da Beta
Reclamações de clientes sem resolução
Promessas de pagamento desta semana
```

A view guarda query, filtros, ordenação, agrupamento e timezone. Ela não copia dados.

## 14. Indexação temporal

O documento indexável deve manter múltiplos campos:

```text
message_sent_at
message_received_at
event_occurred_at
object_created_at
state_changed_at
due_at
processed_at
```

Criar índices separados para consultas comuns:

```text
(workspace_id, conversation_id, message_sent_at)
(workspace_id, conversation_id, event_occurred_at)
(workspace_id, conversation_id, object_created_at)
(workspace_id, conversation_id, due_at)
```

A query deve declarar qual eixo temporal está sendo utilizado.

## 15. Busca por janela

Para perguntas como “o que foi decidido depois da reunião?”, primeiro resolver a reunião, depois usar seu timestamp como âncora e pesquisar uma janela posterior. Para “antes do pagamento”, localizar o evento de pagamento e pesquisar o intervalo anterior.

```text
âncora semântica
  → timestamp
  → janela relativa
  → filtros
  → resultados
```

## 16. Paginação e desempenho

Para conversas grandes:

- carregar mensagens por janela temporal;
- virtualizar a lista;
- carregar timeline estruturada em páginas ou blocos;
- indexar mídias e documentos separadamente;
- não enviar toda a conversa ao LLM;
- manter o cursor de posição ao alternar vistas.

## 17. Precisão e ruído

A timeline deve priorizar:

```text
objeto aberto
objeto atrasado
decisão
compromisso
aprovação
reclamação
pedido/entrega
arquivo relevante
```

Mensagens puramente sociais, saudações e duplicatas podem ficar em contexto secundário, mas nunca devem ser apagadas ou confundidas com eventos de negócio.

## 18. Testes de busca

Testar:

```text
palavra exata
sinônimo
nome com acento
apelido
empresa homônima
mensagem em grupo
mensagem editada
áudio transcrito
arquivo sem texto
período relativo
projeto com nome semelhante
objeto com múltiplas evidências
```

O resultado esperado deve informar precisão, contexto e origem.
