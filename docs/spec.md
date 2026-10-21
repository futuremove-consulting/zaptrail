# ZapTrail — Especificação Técnica do MVP (v1.0.0)

- **Produto**: ZapTrail
- **Domínio inicial**: Imobiliário (`real_estate`)
- **Versão**: 1.0.0
- **Data**: 2026-10-20
- **Status**: Especificação de referência para implementação

## 1. Objetivo do MVP

Converter mensagens de WhatsApp em informações estruturadas, rastreáveis e acionáveis, identificando contatos, relacionamentos, imóveis, intenções, oportunidades e próximas ações; criar ou atualizar registros no CRM sem duplicidade; e preservar evidências, incertezas e histórico.

O motor não é um chatbot de atendimento genérico, nem apenas um sumarizador. É um sistema de **interpretação semântica + resolução de entidades + decisão operacional + execução controlada**, arquitetado em camadas desacopladas (`@futuremove/zaptrail-core` universal + `@futuremove/zaptrail-domain-real-estate` plugável + `CRMAdapter`).

## 2. Princípios Arquiteturais Obrigatórios

1. **Separação entre núcleo universal e pacote de domínio**:
   - **Camada A (`@futuremove/zaptrail-core`)**: `Conversation`, `Message`, `TurnWindow`, `Participant`, `ActorProfile`, `IntentObservation`, `FactObservation`, `ValueObservation`, `RelationshipObservation`, `ConditionObservation`, `OpportunityAssessment`, `ActionRecommendation`, `EvidenceRef`, `ReviewItem`, `ExtractionRun`. Nenhum campo exclusivo de imóvel (`iptu`, `condominio`, `quartos`, `matricula`) pode existir nas tabelas/tipos centrais do núcleo universal.
   - **Camada B (`@futuremove/zaptrail-domain-real-estate`)**: `RealEstatePropertyCandidate`, `RealEstateDemandProfile`, `RealEstateListingCondition`, `RealEstatePartyRole`, `RealEstateOpportunitySubtype`, `RealEstateValuationSignal`, `RealEstateActionPlaybook`.
2. **Separação Epistêmica (`EpistemicStatus`)**:
   - `declared` | `inferred` | `validated_external` | `validated_human` | `superseded` | `rejected`
3. **Evidência Obrigatória (`EvidenceRef`)**:
   - Toda afirmação relevante deve apontar para `message_id`, `conversation_id`, `exact_quote` (e cálculo determinístico de `char_start`/`char_end` em TypeScript, nunca pelo LLM), `timestamp`, `extractor_type` (`rule` | `llm` | `hybrid` | `human`), `parser_version`, `confidence` (`0.00` a `1.00`).
4. **Oportunidade ≠ Conversa ≠ Imóvel**:
   - Uma mesma conversa pode conter o Imóvel A recusado (`not_interested_property`), um segundo Imóvel B ofertado (`CAPTURE_OTHER_PROPERTY`: `real_estate.capture_sale` / `real_estate.capture_rent`), e uma demanda de compra/permuta (`real_estate.demand_buy`) condicionada à venda (`sale_before_purchase`).
5. **Execução Controlada e Idempotência**:
   - `>= 0.85`: atualização automática de campos não críticos e criação de rascunho/oportunidade sem efeito externo irreversível.
   - `0.65 a 0.84`: persistir como `inferred` ou `pending_confirmation`, criar `ReviewItem` se afetar entidade crítica.
   - `< 0.65`: não sobrescrever dados confirmados; registrar apenas como observação/hipótese ou fila de revisão.
   - Ações externas (`send_whatsapp_followup`, etc.) nunca disparam autonomamente no MVP.

## 3. Taxonomia do Domínio Imobiliário (MVP)

### 3.1 Relação Contato–Imóvel (`RealEstatePartyRole`)
- `owner` (proprietário)
- `co_owner` (coproprietário)
- `spouse_or_partner` (cônjuge/companheiro)
- `family_member` (familiar)
- `friend_or_acquaintance` (amigo/conhecido do proprietário)
- `representative_or_advisor` (representante/procurador/administrador)
- `broker_or_intermediary` (corretor/imobiliária/intermediário)
- `tenant_or_occupant` (inquilino/ocupante)
- `unrelated_third_party` (terceiro sem relação)
- `unknown` (relação não identificada)

### 3.2 Intenções (`IntentLabel`)
- `intent.capture_for_sale` (`[0.80, 0.98]` explícito)
- `intent.capture_for_rent` (`[0.80, 0.98]` explícito)
- `intent.capture_for_sale_and_rent` (`[0.85, 0.98]`)
- `intent.not_interested_property` (`[0.80, 0.98]`)
- `intent.not_interested_general` (`[0.75, 0.95]`)
- `intent.do_not_contact` (`[0.90, 1.00]` — bloqueio imediato de follow-up)
- `intent.capture_other_property` (`[0.75, 0.95]` — outro imóvel disponível)
- `intent.buy_demand` (`[0.75, 0.95]`)
- `intent.rent_demand` (`[0.75, 0.95]`)
- `intent.investment_demand` (`[0.75, 0.95]`)
- `intent.conditional_interest` (`[0.70, 0.90]`)
- `intent.future_interest` (`[0.70, 0.90]`)
- `intent.refer_third_party` (`[0.80, 0.95]`)
- `intent.request_information` (`[0.75, 0.95]`)
- `intent.provide_information` (`[0.75, 0.95]`)
- `intent.schedule_or_availability` (`[0.75, 0.95]`)
- `intent.price_or_condition_update` (`[0.80, 0.95]`)
- `intent.ambiguous_or_Open` (`[0.40, 0.70]`)
- `intent.noise_or_ack` (`[0.85, 0.99]`)

### 3.3 Condicionantes (`ConditionType`)
- `sale_before_purchase`
- `minimum_net_proceeds`
- `tenant_vacating`
- `family_approval`
- `documentation_regularization`
- `Reform_or_maintenance`
- `date_or_timeframe`
- `exclusivity_Constraint`
- `broker_commission_condition`
- `custom_condition`

### 3.4 Tipos de Oportunidade (`OpportunityType`)
- `real_estate.capture_sale`
- `real_estate.capture_rent`
- `real_estate.capture_sale_and_rent`
- `real_estate.demand_buy`
- `real_estate.demand_rent`
- `real_estate.demand_investment`
- `real_estate.owner_discovery`
- `real_estate.future_nurture`

### 3.5 Tipos de Ação Recomendada (`ActionType`)
- `qualify_property`
- `qualify_owner_role`
- `request_owner_contact`
- `request_property_details`
- `request_media`
- `schedule_visit_or_call`
- `register_future_followup`
- `open_buyer_search`
- `link_conditional_opportunities`
- `human_review`
- `suppress_commercial_followup`

## 4. Casos de Teste Obrigatórios (20 Golden Cases — §21.2)

1. **CT-01**: Proprietário confirma interesse em vender ("Sou o dono sim, estou vendendo por 1,2 milhão.") -> `role=owner`, `intent.capture_for_sale`, `sale_asking_price=1200000`, `real_estate.capture_sale`, `qualify_property`.
2. **CT-02**: Proprietário confirma interesse em alugar ("Quero alugar por 4.500, condomínio 900 e IPTU 250.") -> `role=owner`, `intent.capture_for_rent`, `rent_asking_price=4500`, `condo_fee=900`, `iptu_amount=250`, `real_estate.capture_rent`.
3. **CT-03**: Venda e locação simultâneas ("Pode trabalhar venda por 950 mil ou locação por 4.200.") -> `intent.capture_for_sale_and_rent`, `sale_asking_price=950000`, `rent_asking_price=4200`, `real_estate.capture_sale_and_rent`.
4. **CT-04**: Cônjuge responde ("Esse apartamento é meu e do meu marido, estamos pensando em vender.") -> `role=spouse_or_partner`, `intent.capture_for_sale`, `real_estate.capture_sale`.
5. **CT-05**: Familiar/conhecido indica o dono ("Não sou eu, é do meu irmão Carlos, fala com ele no 11 98888-7777.") -> `role=family_member`, `intent.refer_third_party`, `real_estate.owner_discovery`, `request_owner_contact`.
6. **CT-06**: Número errado / sem relação ("Engano, não tenho imóvel nenhum nesse condomínio.") -> `role=unrelated_third_party`, `intent.not_interested_general`, sem oportunidade.
7. **CT-07**: Opt-out explícito ("Não tenho interesse e por favor pare de me mandar mensagem.") -> `intent.do_not_contact`, `suppress_commercial_followup` (`do_not_contact=true`).
8. **CT-08**: Recusa do imóvel perguntado, mas oferta de outro imóvel ("Esse da Rua X eu não vendo porque moro nele, mas tenho uma sala comercial no Centro para vender por 380 mil.") -> Imóvel 1 `intent.not_interested_property`; Imóvel 2 (`property_type=commercial`, `sale_asking_price=380000`) com `intent.capture_other_property` e `real_estate.capture_sale`.
9. **CT-09**: Recusa de venda, mas demanda de compra/investimento ("Não quero vender o meu, mas estou procurando uma casa maior no mesmo bairro até 2 milhões.") -> `intent.not_interested_property` no atual + `intent.buy_demand` (`real_estate.demand_buy`, `budget_max=2000000`, `property_types=['house']`).
10. **CT-10**: Demanda de compra condicionada à venda do atual ("Quero comprar um de 3 quartos, mas só consigo se vender o meu atual de 2 quartos antes.") -> Duas oportunidades (`real_estate.capture_sale` + `real_estate.demand_buy`) vinculadas por `ConditionObservation` (`sale_before_purchase`) e ação `link_conditional_opportunities`.
11. **CT-11**: Interesse futuro com janela temporal ("Agora está alugado, só penso em vender depois de março do ano que vem.") -> `intent.future_interest`, `occupancy_status=tenant_occupied`, `real_estate.future_nurture`, `register_future_followup`.
12. **CT-12**: Preço em formato coloquial ("1,2 mi", "850 mil", "3.5k de aluguel", "cond 900") -> Normalização numérica exata (`1200000`, `850000`, `3500`, `900` em BRL).
13. **CT-13**: Atualização/correção de preço em mensagem posterior ("Subi o valor, agora não fecho por menos de 1,35 milhão.") -> Novo `ValueObservation` ativo (`1350000`) e anterior marcado como `superseded` sem apagar histórico.
14. **CT-14**: Corretor/intermediário responde ("Sou corretor e tenho a exclusividade desse imóvel, faço parceria fifty-fifty.") -> `role=broker_or_intermediary`, condição `exclusivity_constraint` / `broker_commission_condition`.
15. **CT-15**: Resposta curta "Sim" dependente da pergunta outbound anterior ("Você tem interesse em vender ou alugar seu imóvel no Edifício Solar?") -> Interpreta "Sim" usando `TurnWindow` outbound, gerando `intent.ambiguous_or_open` (vender ou alugar ainda aberto) + `qualify_property` para especificar modalidade e valor.
16. **CT-16**: Resposta ambígua ("Depende da proposta, quanto estão pagando?") -> `intent.conditional_interest` / `intent.ambiguous_or_open`, `qualify_property`.
17. **CT-17**: Múltiplas mensagens fragmentadas do mesmo contato em sequência rápida ("Oi" / "Sou proprietário sim" / "Quero vender" / "980 mil") -> Consolidadas na `TurnWindow` em uma única extração coerente (`role=owner`, `intent.capture_for_sale`, `sale_asking_price=980000`).
18. **CT-18**: Recebimento do mesmo webhook duas vezes -> Idempotência por `(tenant_id, provider, external_message_id)` sem duplicar oportunidades ou ações.
19. **CT-19**: Mensagem apenas com mídia ("Segue foto da sala" + anexo imagem) -> Associa mídia (`MediaUnderstandingResult` / anexo) ao `PropertyCandidate` em discussão e preserva evidência.
20. **CT-20**: Baixa confiança ou conflito ("Meu marido disse que não vende, mas se chegar em 1,5 mi eu convenço ele.") -> Registra `ConditionObservation` (`family_approval`) + gera `ReviewItem` (`review_required=true`, `human_review`) sem disparo automático.
