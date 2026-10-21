# Phase 2: Hybrid Stage 2 Structured LLM Fallback & Outbound Context - Specification

**Document:** 02-SPEC.md  
**Phase:** 2  
**Status:** Approved Reference  
**Created:** 2026-10-21  

---

## 1. Phase Goal

Implementar o Estágio 2 híbrido com LLM Structured Outputs (acionado apenas quando o Estágio 1 determinístico sinalizar ambiguidade ou complexidade), validação estrita de `exact_quote` contra alucinações, coalescência temporal de turnos fragmentados e injeção de candidatos pré-cadastrados (`seeded_property_candidates`) de campanhas outbound.

---

## 2. Requirements & Traceability

### `LLM-01`: Hybrid Routing & Stage 2 Structured LLM Fallback
- O sistema executa primeiro o Estágio 1 determinístico (`RealEstateDomainPack`).
- Se o Estágio 1 atingir confiança `>= 0.85` e intenção conclusiva (sem flags de ambiguidade), o envelope é finalizado com `extractor_type: 'rule'` e `llm_invoked: false`.
- Se o Estágio 1 retornar confiança `< 0.85`, papel `unknown`, intenção `intent.ambiguous_or_open` ou contradição semântica, o motor aciona o Estágio 2 através do `LLMProvider`.
- O resultado do Estágio 2 é estruturado via schema Zod (`RealEstateLLMStructuredOutputSchema`) e mesclado ao envelope unificado com `extractor_type: 'hybrid'`.

### `LLM-02`: Hallucination Detection & Exact Quote Validation
- Todo campo extraído pelo Estágio 2 deve fornecer uma `exact_quote`.
- O validador determinístico do core busca a citação literal na mensagem original do turno.
- Se a citação não for substring exata da mensagem:
  1. A evidência é marcada com `hallucination_detected: true`.
  2. O `char_start` e `char_end` NÃO são inventados (definidos como `null` ou `undefined`).
  3. A entidade tem seu status epistêmico marcado como `inferred` com confiança `< 0.65`.
  4. Um `ReviewItem` mandatório é adicionado ao envelope (`review_required: true`, motivo: `"Citação não encontrada no texto original"`).

### `ING-01`: TurnWindow Coalescence & Outbound Campaign Seeding
- Mensagens do mesmo remetente recebidas em um intervalo curto (janela configurável de debounce, ex.: 120s) são coalescidas em um único objeto `TurnWindow`.
- A mensagem consolidada agrega os textos, mantendo no array `messages` os identificadores, timestamps e payloads de mídia de cada mensagem original.
- Campanhas outbound de captação podem anexar um ou mais `SeededPropertyCandidate` (endereço, condomínio, código de referência no CRM, tipo de abordagem).
- Quando o contato responde a uma mensagem de campanha outbound, o motor vincula a intenção e os valores ao imóvel da abordagem inicial como `PropertyCandidate` principal.

---

## 3. Edge Coverage

| ID | Cenário Limite | Comportamento Esperado |
|---|---|---|
| `E-02-01` | Estágio 1 resolve 100% (ex.: CT-01, CT-06, CT-10) | LLM não é chamado (`llm_invoked: false`). Latência < 5ms. |
| `E-02-02` | Turno com gíria coloquial não capturada por regex ("Tô afim de passar o ponto desse ap, mas tá enrolado no cartório") | Estágio 1 marca `ambiguous_or_open` / baixa confiança; Estágio 2 é acionado; LLM identifica intenção de venda com condicionante de documentação/regularização. |
| `E-02-03` | LLM resume ou parafraseia em vez de citar ("proprietário quer vender por 1 milhão") | Validador rejeita a citação porque a frase exata não está no texto do usuário; rebaixa para hipótese com flag de revisão humana. |
| `E-02-04` | Usuário envia 4 mensagens em 40 segundos ("Oi", "É sobre o ap", "Posso vender sim", "Faz por 700 mil?") | Coalescer agrupa as 4 mensagens em uma única `TurnWindow`; a interpretação processa o texto unificado e gera observações com as evidências de cada mensagem respectiva. |
| `E-02-05` | Resposta curta a campanha outbound ("Sim, pode anunciar") | Com o seed do imóvel injetado na `TurnWindow`, a resposta "Sim" deixa de ser uma hipótese genérica e é atribuída ao imóvel da campanha (`capture_sale` no imóvel abordado). |
| `E-02-06` | Resposta negativa ao imóvel da campanha, mas ofertando outro imóvel ("Esse do centro já vendi, mas tenho um nos Jardins") | Estágio 2 ou Coalescer identifica recusa do imóvel semeado e instancia um segundo `PropertyCandidate` para o imóvel novo. |
| `E-02-07` | Falha de rede / Timeout na chamada ao LLM | O motor captura a exceção do `LLMProvider`, faz fallback gracioso para a interpretação do Estágio 1, marca o envelope com `llm_error: true` e gera `ReviewItem` para conferência humana. |

---

## 4. Prohibitions (must-NOT)

1. **MUST NOT** invocar o LLM em turnos resolvidos com alta confiança (`confidence >= 0.85`) e intenção explícita pelo Estágio 1 (economia estrita de tokens e latência).
2. **MUST NOT** aceitar citações aproximadas ou alucinadas pelo LLM como `exact_quote` válida sem verificação de substring literal.
3. **MUST NOT** permitir que `char_start` e `char_end` sejam calculados pelo LLM (cálculo de índices deve ser 100% determinístico no TypeScript).
4. **MUST NOT** vazar conceitos de imobiliária no contrato `LLMProvider` do `@futuremove/zaptrail-core`.
5. **MUST NOT** exceder o limite de 350 linhas por arquivo de código fonte (`quality/max-lines`).
