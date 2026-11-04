import {
  TurnWindow,
  OpportunityAssessment,
} from '../core/types';
import {
  RealEstatePropertyCandidate,
  RealEstateDemandProfile,
} from './types';
import { PropertyMetricsResult } from './normalizer-ptbr';

export interface EnrichOpportunityAttributesInput {
  turnWindow: TurnWindow;
  opportunities: OpportunityAssessment[];
  propertyCandidates: RealEstatePropertyCandidate[];
  demandProfiles: RealEstateDemandProfile[];
  metrics: PropertyMetricsResult[];
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartamento',
  house: 'Casa',
  commercial: 'Comercial',
  land: 'Terreno',
  other: 'Imóvel',
};

/**
 * Populates OpportunityAssessment.attributes with normalized 7-layer domain attributes
 * and PilotCRM ProposalPayload compatible metadata (Decision 1 & Decision 3).
 */
export function enrichOpportunitiesWithAttributes(input: EnrichOpportunityAttributesInput): void {
  const { turnWindow, opportunities, propertyCandidates, demandProfiles, metrics } = input;

  const inboundMsg = turnWindow.messages.find((m) => m.direction === 'inbound') ?? turnWindow.messages[0];
  const senderPhone = inboundMsg?.sender_id || '';
  const senderName = inboundMsg?.sender_name || '';

  const subtype = metrics.map((m) => m.property_subtype).find(Boolean);
  const neighborhood = metrics.map((m) => m.neighborhood).find(Boolean);
  const timing = metrics.map((m) => m.timing).find(Boolean);

  for (const opp of opportunities) {
    const isDemand = opp.opportunity_type.startsWith('real_estate.demand_');
    const side: 'CAPTACAO' | 'DEMANDA' = isDemand ? 'DEMANDA' : 'CAPTACAO';

    let intention = 'venda';
    if (opp.opportunity_type === 'real_estate.capture_rent' || opp.opportunity_type === 'real_estate.demand_rent') {
      intention = 'locacao';
    } else if (opp.opportunity_type === 'real_estate.capture_sale_and_rent') {
      intention = 'venda_compra';
    } else if (opp.opportunity_type === 'real_estate.demand_buy') {
      intention = 'compra';
    }

    if (isDemand) {
      const demand = demandProfiles.find((d) => d.demand_key === opp.entity_key) ?? demandProfiles[0];
      const propType = demand?.property_types?.[0] ?? 'apartment';
      const propLabel = subtype ? subtype.charAt(0).toUpperCase() + subtype.slice(1) : (PROPERTY_TYPE_LABELS[propType] ?? 'Imóvel');
      const budget = demand?.budget_max;
      const rooms = demand?.bedrooms_min;
      const titleParts = [`Demanda ${propLabel}`];
      if (rooms) titleParts.push(`${rooms}Q`);
      if (neighborhood) titleParts.push(`em ${neighborhood}`);

      opp.attributes = {
        ...opp.attributes,
        side,
        intention,
        timing: timing ?? 'flexible',
        neighborhood,
        property_type: propType,
        property_subtype: subtype,
        bedrooms: rooms,
        budget_max: budget,
        price: budget,
        targetValue: budget !== undefined ? String(budget) : undefined,
        phone: senderPhone,
        contactName: senderName || undefined,
        title: titleParts.join(' '),
      };
    } else {
      const prop = propertyCandidates.find((p) => p.property_key === opp.entity_key) ?? propertyCandidates[0];
      const propType = prop?.property_type ?? 'apartment';
      const propLabel = subtype ? subtype.charAt(0).toUpperCase() + subtype.slice(1) : (PROPERTY_TYPE_LABELS[propType] ?? 'Imóvel');
      const price = prop?.sale_asking_price ?? prop?.rent_asking_price;
      const rooms = prop?.bedrooms;
      const area = prop?.area_m2;
      const titleParts = [`Captação ${propLabel}`];
      if (rooms) titleParts.push(`${rooms}Q`);
      if (neighborhood) titleParts.push(`no ${neighborhood}`);

      opp.attributes = {
        ...opp.attributes,
        side,
        intention,
        timing: timing ?? 'flexible',
        neighborhood,
        property_type: propType,
        property_subtype: subtype,
        bedrooms: rooms,
        area_m2: area,
        price,
        targetValue: price !== undefined ? String(price) : undefined,
        phone: senderPhone,
        contactName: senderName || undefined,
        title: titleParts.join(' '),
        propertyDraft: {
          name: titleParts.join(' '),
          type: propType === 'other' ? 'apartment' : propType,
          price,
          neighborhood,
          rooms,
          area_sqm: area,
          description: turnWindow.consolidated_text,
        },
      };
    }
  }
}
