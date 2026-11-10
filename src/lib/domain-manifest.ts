import type { DomainPackUIManifest } from './domain-manifest.types';

/** Real Estate domain manifest — Imobiliário */
export const REAL_ESTATE_MANIFEST: DomainPackUIManifest = {
  domain_key: 'real_estate',
  display_name: 'Imobiliário',
  icon: 'Building2',
  description: 'Extração semântica para conversas imobiliárias — compra, venda, locação.',
  official: true,
  available: true,
  labels: {
    opportunity: 'Oportunidade Imobiliária',
    participant: 'Participante',
    intent: 'Intenção Imobiliária',
    entity: 'Imóvel',
  },
  role_labels: {
    owner: 'Proprietário',
    seller_or_landlord: 'Proprietário',
    buyer: 'Comprador',
    buyer_or_tenant: 'Comprador / Locatário',
    seller: 'Vendedor',
    tenant: 'Locatário',
    landlord: 'Proprietário',
    agent: 'Corretor',
    broker: 'Corretor',
    intermediary: 'Imobiliária',
    unknown: 'Desconhecido',
  },
  opportunity_labels: {
    'real_estate.sale': 'Venda de Imóvel',
    'real_estate.rental': 'Locação de Imóvel',
    'real_estate.lease': 'Locação de Imóvel',
    'real_estate.purchase': 'Compra de Imóvel',
    'real_estate.buyer_demand': 'Demanda de Compra',
    'real_estate.valuation': 'Avaliação',
    'real_estate.exchange': 'Permuta',
    'real_estate.financing': 'Financiamento',
  },
  intent_labels: {
    'intent.buy': 'Comprar',
    'intent.sell': 'Vender',
    'intent.rent': 'Alugar',
    'intent.invest': 'Investir',
    'intent.evaluate': 'Avaliar',
    'intent.negotiate': 'Negociar',
    'intent.schedule_visit': 'Agendar visita',
    'intent.request_info': 'Solicitar informações',
    'intent.unknown': 'Desconhecido',
  },
  extra_columns: [
    {
      key: 'sale_asking_price',
      label: 'Preço Pedido',
      header: 'Preço Pedido',
      path: 'opportunities.0.attributes.sale_asking_price',
      accessor: 'opportunities.0.attributes.sale_asking_price',
      type: 'currency',
      format: 'currency_brl',
      sortable: true,
    },
    {
      key: 'property_type',
      label: 'Tipo',
      header: 'Tipo',
      path: 'opportunities.0.attributes.property_type',
      accessor: 'opportunities.0.attributes.property_type',
      type: 'text',
      format: 'text',
    },
    {
      key: 'neighborhood',
      label: 'Bairro',
      header: 'Bairro',
      path: 'opportunities.0.attributes.neighborhood',
      accessor: 'opportunities.0.attributes.neighborhood',
      type: 'text',
      format: 'text',
    },
  ],
  extra_filters: [
    {
      key: 'property_type',
      label: 'Tipo de imóvel',
      type: 'select',
      options: [
        { value: 'apartment', label: 'Apartamento' },
        { value: 'house', label: 'Casa' },
        { value: 'commercial', label: 'Comercial' },
        { value: 'land', label: 'Terreno' },
      ],
    },
    {
      key: 'price_range',
      label: 'Faixa de preço',
      type: 'range',
    },
  ],
};

export const HEALTHCARE_MANIFEST: DomainPackUIManifest = {
  domain_key: 'healthcare',
  display_name: 'Saúde',
  icon: 'Heart',
  description: 'Extração semântica para clínicas, telemedicina e planos de saúde.',
  official: true,
  available: false,
  coming_soon: true,
  labels: {
    opportunity: 'Atendimento Clínico',
    participant: 'Paciente / Profissional',
    intent: 'Intenção Clínica',
    entity: 'Procedimento',
  },
  role_labels: {
    patient: 'Paciente',
    doctor: 'Médico',
    receptionist: 'Recepção',
  },
  opportunity_labels: {
    'healthcare.appointment': 'Agendamento de Consulta',
    'healthcare.exam': 'Exame',
  },
  intent_labels: {
    'intent.schedule_appointment': 'Agendar consulta',
    'intent.check_results': 'Consultar exames',
  },
  extra_columns: [],
  extra_filters: [],
};

export const B2B_MANIFEST: DomainPackUIManifest = {
  domain_key: 'b2b_services',
  display_name: 'B2B Services',
  icon: 'Briefcase',
  description: 'Extração semântica para vendas consultivas e contratos B2B.',
  official: true,
  available: false,
  coming_soon: true,
  labels: {
    opportunity: 'Oportunidade B2B',
    participant: 'Stakeholder',
    intent: 'Intenção Comercial',
    entity: 'Proposta',
  },
  role_labels: {
    decision_maker: 'Decisor',
    champion: 'Champion',
    account_executive: 'Executivo de Contas',
  },
  opportunity_labels: {
    'b2b.enterprise_deal': 'Contrato Enterprise',
  },
  intent_labels: {
    'intent.request_proposal': 'Solicitar proposta',
  },
  extra_columns: [],
  extra_filters: [],
};

/** Generic fallback manifest for unknown domain keys */
export const GENERIC_MANIFEST: DomainPackUIManifest = {
  domain_key: 'generic',
  display_name: 'Domínio Personalizado',
  icon: 'Layers',
  description: 'Domínio genérico ou customizado.',
  official: false,
  available: true,
  labels: {
    opportunity: 'Oportunidade',
    participant: 'Participante',
    intent: 'Intenção',
    entity: 'Entidade',
  },
  role_labels: {},
  opportunity_labels: {},
  intent_labels: {},
  extra_columns: [],
  extra_filters: [],
};

/** All registered manifests keyed by domain_key */
export const DOMAIN_MANIFESTS: Record<string, DomainPackUIManifest> = {
  real_estate: REAL_ESTATE_MANIFEST,
  healthcare: HEALTHCARE_MANIFEST,
  health: HEALTHCARE_MANIFEST,
  b2b_services: B2B_MANIFEST,
  generic: GENERIC_MANIFEST,
};

/** Catalogue entries shown in the Domain Pack catalog page */
export const DOMAIN_CATALOG: DomainPackUIManifest[] = [
  REAL_ESTATE_MANIFEST,
  HEALTHCARE_MANIFEST,
  B2B_MANIFEST,
];

/** Returns the manifest for a given domain key, or the generic fallback. */
export function getDomainManifest(domainKey?: string): DomainPackUIManifest {
  if (!domainKey) return REAL_ESTATE_MANIFEST;
  return DOMAIN_MANIFESTS[domainKey] ?? GENERIC_MANIFEST;
}

export function registerDomainManifest(manifest: DomainPackUIManifest): void {
  DOMAIN_MANIFESTS[manifest.domain_key] = manifest;
  if (!DOMAIN_CATALOG.some((item) => item.domain_key === manifest.domain_key)) {
    DOMAIN_CATALOG.push(manifest);
  }
}
