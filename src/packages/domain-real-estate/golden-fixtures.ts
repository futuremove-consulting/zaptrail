import { TurnWindow, ConversationMessage, ValueObservation } from '../core/types';
import { coalesceTurnWindow } from './opportunity-orchestrator';

export interface GoldenCaseExpectation {
  role_label?: string;
  intent_labels?: string[];
  opportunity_types?: string[];
  action_types?: string[];
  condition_types?: string[];
  enrichment_actions?: string[];
  values?: Array<{ field_key: string; amount: number; target_entity_key?: string }>;
  do_not_contact?: boolean;
  duplicate?: boolean;
  review_required?: boolean;
}

export interface GoldenCaseFixture {
  case_id: string;
  name: string;
  description: string;
  turnWindow: TurnWindow;
  expectations: GoldenCaseExpectation;
}

function turn(
  caseId: string,
  texts: Array<string | { text: string; attachments?: ConversationMessage['attachments'] }>,
  opts: { priorOutbound?: string; existing_values?: ValueObservation[] } = {}
): TurnWindow {
  const raw_messages = texts.map((t, idx) => ({
    message_id: `msg-${caseId}-${idx + 1}`,
    external_message_id: `ext-${caseId}-${idx + 1}`,
    direction: 'inbound' as const,
    sender_id: '5511999990000',
    raw_text: typeof t === 'string' ? t : t.text,
    timestamp: '2026-10-21T12:00:00.000Z',
    attachments: typeof t === 'string' ? [] : (t.attachments ?? []),
  }));

  const prior = opts.priorOutbound ? {
    message_id: `out-${caseId}`,
    external_message_id: `ext-out-${caseId}`,
    tenant_id: 'tenant-gold',
    provider: 'whatsapp',
    conversation_id: `conv-${caseId}`,
    direction: 'outbound' as const,
    sender_id: 'system',
    raw_text: opts.priorOutbound,
    normalized_text: opts.priorOutbound.trim(),
    timestamp: '2026-10-21T11:59:00.000Z',
    attachments: [],
  } : undefined;

  return coalesceTurnWindow({
    turn_id: `turn-${caseId}`,
    tenant_id: 'tenant-gold',
    provider: 'whatsapp',
    conversation_id: `conv-${caseId}`,
    raw_messages,
    prior_outbound_message: prior,
    existing_values: opts.existing_values,
  });
}

const dummyEv = {
  evidence_id: 'ev-seed-1', message_id: 'msg-seed-1', conversation_id: 'conv-CT-13',
  exact_quote: '1.200.000', char_start: 0, char_end: 9, timestamp: '2026-10-20T12:00:00.000Z',
  extractor_type: 'rule' as const, parser_version: '1.0.0', confidence: 0.95,
};

export const GOLDEN_CASE_FIXTURES: GoldenCaseFixture[] = [
  {
    case_id: 'CT-01', name: 'Venda explícita por proprietário',
    description: 'Proprietário confirma interesse em vender por 1,2 milhão',
    turnWindow: turn('CT-01', ['Sou o dono sim, estou vendendo por 1,2 milhão.']),
    expectations: {
      role_label: 'owner', intent_labels: ['intent.capture_for_sale'],
      opportunity_types: ['real_estate.capture_sale'], action_types: ['qualify_property'],
      enrichment_actions: ['ADD'], values: [{ field_key: 'sale_asking_price', amount: 1200000 }],
    },
  },
  {
    case_id: 'CT-02', name: 'Locação com condomínio e IPTU',
    description: 'Proprietário confirma interesse em alugar por 4.500, condomínio 900 e IPTU 250',
    turnWindow: turn('CT-02', ['Quero alugar por 4.500, condomínio 900 e IPTU 250.']),
    expectations: {
      role_label: 'owner', intent_labels: ['intent.capture_for_rent'],
      opportunity_types: ['real_estate.capture_rent'], action_types: ['qualify_property'],
      enrichment_actions: ['ADD'], values: [
        { field_key: 'rent_asking_price', amount: 4500 },
        { field_key: 'condo_fee', amount: 900 },
        { field_key: 'iptu_amount', amount: 250 },
      ],
    },
  },
  {
    case_id: 'CT-03', name: 'Venda e locação simultâneas',
    description: 'Pode trabalhar venda por 950 mil ou locação por 4.200',
    turnWindow: turn('CT-03', ['Pode trabalhar venda por 950 mil ou locação por 4.200.']),
    expectations: {
      intent_labels: ['intent.capture_for_sale_and_rent'],
      opportunity_types: ['real_estate.capture_sale_and_rent'],
      action_types: ['qualify_property'], enrichment_actions: ['ADD'],
      values: [
        { field_key: 'sale_asking_price', amount: 950000 },
        { field_key: 'rent_asking_price', amount: 4200 },
      ],
    },
  },
  {
    case_id: 'CT-04', name: 'Cônjuge respondendo',
    description: 'Esse apartamento é meu e do meu marido, estamos pensando em vender',
    turnWindow: turn('CT-04', ['Esse apartamento é meu e do meu marido, estamos pensando em vender.']),
    expectations: {
      role_label: 'spouse_or_partner', intent_labels: ['intent.capture_for_sale'],
      opportunity_types: ['real_estate.capture_sale'], enrichment_actions: ['ADD'],
    },
  },
  {
    case_id: 'CT-05', name: 'Indicação de familiar com contato',
    description: 'Não sou eu, é do meu irmão Carlos, fala com ele no 11 98888-7777',
    turnWindow: turn('CT-05', ['Não sou eu, é do meu irmão Carlos, fala com ele no 11 98888-7777.']),
    expectations: {
      role_label: 'family_member', intent_labels: ['intent.refer_third_party'],
      opportunity_types: ['real_estate.owner_discovery'], action_types: ['request_owner_contact'],
      enrichment_actions: ['ADD'],
    },
  },
  {
    case_id: 'CT-06', name: 'Número errado / terceiro sem relação',
    description: 'Engano, não tenho imóvel nenhum nesse condomínio',
    turnWindow: turn('CT-06', ['Engano, não tenho imóvel nenhum nesse condomínio.']),
    expectations: {
      role_label: 'unrelated_third_party', intent_labels: ['intent.not_interested_general'],
      opportunity_types: [], enrichment_actions: ['INVALIDATE'],
    },
  },
  {
    case_id: 'CT-07', name: 'Opt-out explícito',
    description: 'Não tenho interesse e por favor pare de me mandar mensagem',
    turnWindow: turn('CT-07', ['Não tenho interesse e por favor pare de me mandar mensagem.']),
    expectations: {
      do_not_contact: true, intent_labels: ['intent.do_not_contact'],
      action_types: ['suppress_commercial_followup'], enrichment_actions: ['SUPPRESS'],
    },
  },
  {
    case_id: 'CT-08', name: 'Recusa do principal e oferta de segundo imóvel',
    description: 'Não vende o atual mas oferece sala comercial para venda por 380 mil',
    turnWindow: turn('CT-08', ['Esse da Rua X eu não vendo porque moro nele, mas tenho uma sala comercial no Centro para vender por 380 mil.']),
    expectations: {
      intent_labels: ['intent.not_interested_property', 'intent.capture_other_property', 'intent.capture_for_sale'],
      opportunity_types: ['real_estate.capture_sale'], action_types: ['qualify_property'],
      enrichment_actions: ['ADD'],
      values: [{ field_key: 'sale_asking_price', amount: 380000, target_entity_key: 'property_secondary' }],
    },
  },
  {
    case_id: 'CT-09', name: 'Recusa de venda com demanda de compra',
    description: 'Não quer vender mas procura casa maior até 2 milhões',
    turnWindow: turn('CT-09', ['Não quero vender o meu, mas estou procurando uma casa maior no mesmo bairro até 2 milhões.']),
    expectations: {
      intent_labels: ['intent.not_interested_property', 'intent.buy_demand'],
      opportunity_types: ['real_estate.demand_buy'], action_types: ['open_buyer_search'],
      enrichment_actions: ['ADD'], values: [{ field_key: 'budget_max', amount: 2000000 }],
    },
  },
  {
    case_id: 'CT-10', name: 'Demanda de compra condicionada à venda do atual',
    description: 'Quer comprar um de 3 quartos se vender o de 2 quartos antes',
    turnWindow: turn('CT-10', ['Quero comprar um de 3 quartos, mas só consigo se vender o meu atual de 2 quartos antes.']),
    expectations: {
      opportunity_types: ['real_estate.capture_sale', 'real_estate.demand_buy'],
      condition_types: ['sale_before_purchase'], action_types: ['link_conditional_opportunities'],
      enrichment_actions: ['ADD', 'RELATE'],
    },
  },
  {
    case_id: 'CT-11', name: 'Interesse futuro com imóvel locado',
    description: 'Agora está alugado, só penso em vender depois de março do ano que vem',
    turnWindow: turn('CT-11', ['Agora está alugado, só penso em vender depois de março do ano que vem.']),
    expectations: {
      intent_labels: ['intent.future_interest'], opportunity_types: ['real_estate.future_nurture'],
      action_types: ['register_future_followup'], enrichment_actions: ['DEFER'],
    },
  },
  {
    case_id: 'CT-12', name: 'Preços em formato coloquial pt-BR',
    description: '1,2 mi, 850 mil, 3.5k de aluguel e cond 900',
    turnWindow: turn('CT-12', ['Tenho esse por 1,2 mi, outro por 850 mil, 3.5k de aluguel e cond 900.']),
    expectations: {
      values: [
        { field_key: 'sale_asking_price', amount: 1200000 },
        { field_key: 'sale_asking_price', amount: 850000 },
        { field_key: 'rent_asking_price', amount: 3500 },
        { field_key: 'condo_fee', amount: 900 },
      ],
    },
  },
  {
    case_id: 'CT-13', name: 'Atualização/evolução de preço epistêmica',
    description: 'Subi o valor, agora não fecho por menos de 1,35 milhão',
    turnWindow: turn('CT-13', ['Subi o valor, agora não fecho por menos de 1,35 milhão.'], {
      existing_values: [
        {
          value_id: 'val-ct13-old', field_key: 'sale_asking_price', amount: 1200000,
          currency: 'BRL', raw_expression: '1.200.000', target_entity_key: 'property_primary',
          epistemic_status: 'declared', confidence: 0.95, evidence_refs: [dummyEv],
        },
      ],
    }),
    expectations: {
      intent_labels: ['intent.price_or_condition_update'], enrichment_actions: ['UPDATE'],
      values: [{ field_key: 'sale_asking_price', amount: 1350000 }],
    },
  },
  {
    case_id: 'CT-14', name: 'Corretor com exclusividade e parceria 50/50',
    description: 'Sou corretor e tenho a exclusividade desse imóvel, faço parceria fifty-fifty',
    turnWindow: turn('CT-14', ['Sou corretor e tenho a exclusividade desse imóvel, faço parceria fifty-fifty.']),
    expectations: {
      role_label: 'broker_or_intermediary',
      condition_types: ['exclusivity_constraint', 'broker_commission_condition'],
    },
  },
  {
    case_id: 'CT-15', name: 'Resposta afirmativa curta dependente de contexto outbound',
    description: 'Sim em resposta a Você tem interesse em vender ou alugar?',
    turnWindow: turn('CT-15', ['Sim'], {
      priorOutbound: 'Você tem interesse em vender ou alugar seu imóvel no Edifício Solar?',
    }),
    expectations: {
      intent_labels: ['intent.ambiguous_or_open'], action_types: ['qualify_property'],
    },
  },
  {
    case_id: 'CT-16', name: 'Resposta ambígua com interesse condicional',
    description: 'Depende da proposta, quanto estão pagando?',
    turnWindow: turn('CT-16', ['Depende da proposta, quanto estão pagando?']),
    expectations: {
      intent_labels: ['intent.conditional_interest', 'intent.ambiguous_or_open'],
      action_types: ['qualify_property'],
    },
  },
  {
    case_id: 'CT-17', name: 'Mensagens fragmentadas consolidadas na TurnWindow',
    description: 'Sequência rápida: Oi / Sou proprietário sim / Quero vender / 980 mil',
    turnWindow: turn('CT-17', ['Oi', 'Sou proprietário sim', 'Quero vender', '980 mil']),
    expectations: {
      role_label: 'owner', intent_labels: ['intent.capture_for_sale'],
      opportunity_types: ['real_estate.capture_sale'], values: [{ field_key: 'sale_asking_price', amount: 980000 }],
    },
  },
  {
    case_id: 'CT-18', name: 'Entrega duplicada de webhook (idempotência)',
    description: 'Recebimento repetido da mesma mensagem externa',
    turnWindow: turn('CT-18', ['Sou o dono sim, estou vendendo por 900 mil.']),
    expectations: {
      duplicate: true, opportunity_types: [], enrichment_actions: [],
    },
  },
  {
    case_id: 'CT-19', name: 'Mensagem com anexo de mídia',
    description: 'Segue foto da sala com anexo de imagem',
    turnWindow: turn('CT-19', [
      {
        text: 'Segue foto da sala',
        attachments: [{ attachment_id: 'att-ct-19', mime_type: 'image/jpeg', media_kind: 'photo', caption: 'foto da sala' }],
      },
    ]),
    expectations: { action_types: [] },
  },
  {
    case_id: 'CT-20', name: 'Conflito de interesse conjugal / baixa confiança',
    description: 'Meu marido disse que não vende, mas se chegar em 1,5 mi eu convenço ele',
    turnWindow: turn('CT-20', ['Meu marido disse que não vende, mas se chegar em 1,5 mi eu convenço ele.']),
    expectations: {
      condition_types: ['family_approval'], review_required: true,
      action_types: ['human_review'], enrichment_actions: ['REVIEW'],
    },
  },
];
